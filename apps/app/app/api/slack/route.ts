import { env } from "@/env.mjs";
import { createActivity } from "@/features/activities/functions/createActivity";
import { deleteActivity } from "@/features/activities/functions/deleteActivity";
import { deleteListReactions } from "@/features/activities/functions/deleteListReactions";
import { updateActivity } from "@/features/activities/functions/updateActivity";
import { createChannel } from "@/features/channels/functions/createChannel";
import { deleteChannel } from "@/features/channels/functions/deleteChannel";
import { getChannel } from "@/features/channels/functions/getChannel";
import { updateChannel } from "@/features/channels/functions/updateChannel";
import { getIntegration } from "@/features/integrations/functions/getIntegration";
import { getMember } from "@/features/members/functions/getMember";
import { upsertMember } from "@/features/members/functions/upsertMember";
import { getFiles } from "@/features/slack/helpers/getFiles";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import {
  type GenericMessageEvent,
  type SlackEvent,
  WebClient,
} from "@slack/web-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const web = new WebClient(env.SLACK_BOT_TOKEN);

const bodySchema = z
  .object({
    token: z.string(),
    api_app_id: z.string(),
    team_id: z.string(),
    event: z.custom<SlackEvent>(),
  })
  .passthrough();

export const POST = safeRoute.body(bodySchema).handler(async (_, context) => {
  const body = context.body;

  console.log("ctx", context);

  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  const { token: slack_token, api_app_id, team_id, event } = body;

  if (!event) return NextResponse.json({ status: 200 });

  const { type } = event;

  if (slack_token !== env.SLACK_TOKEN && api_app_id !== env.SLACK_APP_ID) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rIntegration = await getIntegration({ external_id: team_id });
  const integration = rIntegration?.data;

  if (!integration) return NextResponse.json({ status: 200 });

  const { workspace_id, token } = integration;

  if (!workspace_id || !token) return NextResponse.json({ status: 200 });

  switch (type) {
    case "app_uninstalled": {
      await prisma.integration.delete({
        where: {
          id: integration.id,
        },
      });
      break;
    }

    case "channel_created": {
      const { name, id } = event.channel;

      await createChannel({
        name,
        external_id: id,
        source: "SLACK",
        workspace_id,
      });

      await web.conversations.join({ channel: id });
      break;
    }

    case "channel_rename": {
      const { name, id } = event.channel;

      await updateChannel({ external_id: id, name });
      break;
    }

    case "channel_deleted": {
      const { channel } = event;

      await deleteChannel({ external_id: channel });
      break;
    }

    case "message": {
      const { channel: channel_id, subtype } = event;

      const handleMessage = async (messageEvent: GenericMessageEvent) => {
        const { user, text, thread_ts, ts, files } = messageEvent;

        const { profile } = await web.users.profile.get({ user });
        if (!profile) return NextResponse.json({ status: 200 });

        const {
          first_name,
          last_name,
          real_name,
          email,
          phone,
          image_1024,
          title,
        } = profile;

        const rMember = await upsertMember({
          id: user,
          source: "SLACK",
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

        if (!member) return NextResponse.json({ status: 200 });

        const rChannel = await getChannel({
          external_id: channel_id,
          workspace_id,
        });
        const channel = rChannel?.data;

        if (!channel) return NextResponse.json({ status: 200 });

        const _files = getFiles(files);
        await createActivity({
          external_id: ts,
          member_id: member.id,
          channel_id: channel.id,
          details: {
            message: text ?? "",
            source: "SLACK",
            type: thread_ts ? "REPLY" : "POST",
            files: _files,
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

          const _files = getFiles(files);
          await updateActivity({
            external_id: ts,
            details: {
              message: text ?? "",
              source: "SLACK",
              type: thread_ts ? "REPLY" : "POST",
              files: _files,
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
          if (!channel) return NextResponse.json({ status: 200 });

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
      if (!profile) return NextResponse.json({ status: 200 });

      const {
        first_name,
        last_name,
        real_name,
        email,
        phone,
        image_1024,
        title,
      } = profile;

      const rMember = await upsertMember({
        id: user,
        source: "SLACK",
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

      if (!member) return NextResponse.json({ status: 200 });

      if (!member) return NextResponse.json({ status: 200 });

      const rChannel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });
      const channel = rChannel?.data;

      if (!channel) return NextResponse.json({ status: 200 });

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

      if (!member) return NextResponse.json({ status: 200 });

      const rChannel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });
      const channel = rChannel?.data;

      if (!channel) return NextResponse.json({ status: 200 });

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

    case "member_joined_channel": {
      const { user, inviter, event_ts, channel } = event;

      if (!inviter) break;

      const { profile } = await web.users.profile.get({ user });
      if (!profile) return NextResponse.json({ status: 200 });

      const {
        first_name,
        last_name,
        real_name,
        email,
        phone,
        image_1024,
        title,
      } = profile;

      const rMember = await upsertMember({
        id: user,
        source: "SLACK",
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

      if (!member) return NextResponse.json({ status: 200 });

      const rChannel = await getChannel({
        external_id: channel,
        workspace_id,
      });
      const channelData = rChannel?.data;

      if (!channelData) return NextResponse.json({ status: 200 });

      const currentTimestamp = Math.floor(Number.parseFloat(event_ts));

      const activity = await prisma.activity.findFirst({
        where: {
          member_id: member.id,
          details: {
            path: ["invite_by"],
            equals: inviter,
          },
          AND: [
            {
              created_at: {
                gt: new Date((currentTimestamp - 5) * 1000),
              },
            },
            {
              created_at: {
                lt: new Date((currentTimestamp + 5) * 1000),
              },
            },
          ],
        },
        orderBy: {
          created_at: "desc",
        },
      });

      if (activity) return NextResponse.json({ status: 200 });

      await createActivity({
        external_id: null,
        member_id: member.id,
        channel_id: channelData.id,
        details: {
          message: `<@${inviter}> invited to channel`,
          source: "SLACK",
          type: "INVITE",
          files: [],
          invite_by: inviter,
        },
        created_at: new Date(Number.parseFloat(event_ts) * 1000),
        updated_at: new Date(Number.parseFloat(event_ts) * 1000),
        workspace_id,
      });
      break;
    }

    case "user_change": {
      const { id, deleted } = event.user;

      const response = await web.users.profile.get({ user: id });
      console.log("response", response);
      const profile = response.profile;
      console.log("profile", profile);

      if (!profile) return NextResponse.json({ status: 200 });

      const {
        first_name,
        last_name,
        real_name,
        email,
        phone,
        image_1024,
        title,
      } = profile;

      const rMember = await upsertMember({
        id,
        source: "SLACK",
        first_name,
        last_name,
        full_name: real_name,
        email,
        phone,
        avatar_url: image_1024,
        job_title: title,
        deleted,
        workspace_id,
      });
      const member = rMember?.data;

      if (!member) return NextResponse.json({ status: 200 });

      break;
    }
  }

  return NextResponse.json({ status: 200 });
});
