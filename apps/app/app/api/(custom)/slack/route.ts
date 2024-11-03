import { createActivity } from "@/features/activities/functions/createActivity";
import { deleteActivity } from "@/features/activities/functions/deleteActivity";
import { deleteListReactions } from "@/features/activities/functions/deleteListReactions";
import { updateActivity } from "@/features/activities/functions/updateActivity";
import { createChannel } from "@/features/channels/functions/createChannel";
import { deleteChannel } from "@/features/channels/functions/deleteChannel";
import { getChannel } from "@/features/channels/functions/getChannel";
import { updateChannel } from "@/features/channels/functions/updateChannel";
import { getIntegration } from "@/features/integrations/functions/getIntegration";
import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { getMember } from "@/features/members/functions/getMember";
import { mergeMember } from "@/features/members/functions/mergeMember";
import { updateSlackMember } from "@/features/members/functions/updateSlackMember";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import {
  type GenericMessageEvent,
  type SlackEvent,
  WebClient,
} from "@slack/web-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

const bodySchema = z.object({
  team_id: z.string(),
  event: z.custom<SlackEvent>(),
});

export const POST = safeRoute.body(bodySchema).handler(async (_, context) => {
  const { team_id, event } = context.body;
  const { type } = event;

  console.log(event);

  const rIntegration = await getIntegration({ external_id: team_id });
  const integration = rIntegration?.data;
  const workspace_id = integration?.workspace_id;

  if (!workspace_id) {
    return NextResponse.json(
      { message: "Integration not found" },
      { status: 404 },
    );
  }

  switch (type) {
    case "app_uninstalled": {
      await updateIntegration({
        external_id: team_id,
        status: "DISCONNECTED",
      });
      break;
    }

    case "member_joined_channel": {
      const { profile } = await web.users.profile.get({ user: event.user });

      if (!profile) return;

      const {
        first_name,
        last_name,
        real_name,
        email,
        phone,
        image_1024,
        title,
      } = profile;

      await mergeMember({
        slack_id: event.user,
        first_name,
        last_name,
        full_name: real_name,
        email,
        phone,
        avatar_url: image_1024,
        job_title: title,
        workspace_id,
      });
      break;
    }

    case "team_join": {
      console.log(event);
      break;
    }

    case "channel_created": {
      const { name, id } = event.channel;
      const rChannel = await createChannel({
        name,
        external_id: id,
        source: "SLACK",
        workspace_id,
      });

      if (!rChannel?.data) {
        return NextResponse.json(
          { message: "Channel not created" },
          { status: 400 },
        );
      }

      await web.conversations.join({ channel: id });
      break;
    }

    case "channel_rename": {
      const { name, id } = event.channel;
      await updateChannel({ external_id: id, name });
      break;
    }

    case "channel_deleted": {
      await deleteChannel({ external_id: event.channel });
      break;
    }

    case "message": {
      const { channel: channel_id, subtype } = event;

      const handleMessage = async (messageEvent: GenericMessageEvent) => {
        const { user, text, thread_ts, ts, files } = messageEvent;

        if (!user) {
          return NextResponse.json(
            { message: "User not found" },
            { status: 404 },
          );
        }

        const { profile } = await web.users.profile.get({ user });

        if (!profile) return;

        const {
          first_name,
          last_name,
          real_name,
          email,
          phone,
          image_1024,
          title,
        } = profile;

        const rMember = await mergeMember({
          slack_id: user,
          first_name,
          last_name,
          full_name: real_name,
          email,
          phone,
          avatar_url: image_1024,
          job_title: title,
          workspace_id,
        });
        const member = rMember?.data;

        if (!member) {
          return NextResponse.json(
            { message: "Member not found" },
            { status: 404 },
          );
        }

        const rChannel = await getChannel({
          external_id: channel_id,
          workspace_id,
        });
        const channel = rChannel?.data;

        if (!channel) {
          return NextResponse.json(
            { message: "Channel not found" },
            { status: 404 },
          );
        }

        await createActivity({
          external_id: ts,
          member_id: member.id,
          channel_id: channel.id,
          details: {
            message: text ?? "",
            source: "SLACK",
            type: thread_ts ? "REPLY" : "POST",
            files:
              files?.map(({ title, url_private }) => ({
                title: title ?? "",
                url: url_private ?? "",
              })) ?? [],
            reply_to: thread_ts,
          },
          workspace_id,
        });
      };

      switch (subtype) {
        case undefined:

        case "file_share": {
          await handleMessage(event as GenericMessageEvent);
          break;
        }

        case "message_changed": {
          const { text, ts, thread_ts, files } =
            event.message as GenericMessageEvent;

          const { text: previous_text } =
            event.previous_message as GenericMessageEvent;

          await updateActivity({
            external_id: ts,
            details: {
              message: text ?? "",
              source: "SLACK",
              type: thread_ts ? "REPLY" : "POST",
              files:
                files?.map(({ title, url_private }) => ({
                  title: title ?? "",
                  url: url_private ?? "",
                })) ?? [],
              reply_to: thread_ts,
            },
          });
          break;
        }

        case "message_deleted": {
          const { deleted_ts } = event;
          const rChannel = await getChannel({
            external_id: channel_id,
            workspace_id,
          });

          const channel = rChannel?.data;
          if (!channel) {
            return NextResponse.json(
              { message: "Channel not found" },
              { status: 404 },
            );
          }

          await deleteListReactions({
            channel_id: channel.id,
            react_to: deleted_ts,
          });
          await deleteActivity({
            external_id: deleted_ts,
            channel_id: channel.id,
            workspace_id,
          });
          break;
        }
      }
      break;
    }

    case "reaction_added": {
      const { user, item, reaction } = event;
      const { channel: channel_id, ts } = item;

      const { profile } = await web.users.profile.get({ user });

      if (!profile) return;

      const {
        first_name,
        last_name,
        real_name,
        email,
        phone,
        image_1024,
        title,
      } = profile;

      const rMember = await mergeMember({
        slack_id: user,
        first_name,
        last_name,
        full_name: real_name,
        email,
        phone,
        avatar_url: image_1024,
        job_title: title,
        workspace_id,
      });

      const member = rMember?.data;

      if (!member) {
        return NextResponse.json(
          { message: "Member not found" },
          { status: 404 },
        );
      }

      const rChannel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });
      const channel = rChannel?.data;

      if (!channel) {
        return NextResponse.json(
          { message: "Channel not found" },
          { status: 404 },
        );
      }

      await createActivity({
        external_id: null,
        member_id: member.id,
        channel_id: channel.id,
        details: {
          source: "SLACK",
          type: "REACTION",
          message: reaction,
          files: [],
          react_to: ts,
        },
        workspace_id,
      });
      break;
    }

    case "reaction_removed": {
      const { user, reaction, item } = event;
      const { ts, channel: channel_id } = item;

      const rMember = await getMember({
        slack_id: user,
        workspace_id,
      });
      const member = rMember?.data;

      if (!member) {
        return NextResponse.json(
          { message: "Member not found" },
          { status: 404 },
        );
      }

      const rChannel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });
      const channel = rChannel?.data;

      if (!channel) {
        return NextResponse.json(
          { message: "Channel not found" },
          { status: 404 },
        );
      }

      await prisma.activity.deleteMany({
        where: {
          member_id: member.id,
          channel_id: channel.id,
          AND: [
            {
              details: {
                path: ["react_to"],
                equals: ts,
              },
            },
            {
              details: {
                path: ["message"],
                equals: reaction,
              },
            },
            {
              details: {
                path: ["source"],
                equals: "SLACK",
              },
            },
            {
              details: {
                path: ["type"],
                equals: "REACTION",
              },
            },
          ],
        },
      });

      break;
    }

    case "user_change": {
      const { profile, id } = event.user;
      const { first_name, last_name, title, phone, image_1024 } = profile;

      await updateSlackMember({
        slack_id: id,
        first_name,
        last_name,
        job_title: title,
        phone,
        avatar_url: image_1024,
        workspace_id,
      });
      break;
    }
  }

  return NextResponse.json({ success: true });
});
