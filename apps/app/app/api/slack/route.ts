import { createActivity } from "@/features/bot/activities/createActivity";
import { deleteActivity } from "@/features/bot/activities/deleteActivity";
import { updateActivity } from "@/features/bot/activities/updateActivity";
import { createChannel } from "@/features/bot/channels/createChannel";
import { deleteChannel } from "@/features/bot/channels/deleteChannel";
import { getChannel } from "@/features/bot/channels/getChannel";
import { updateChannel } from "@/features/bot/channels/updateChannel";
import { mergeMember } from "@/features/bot/members/mergeMember";
import { updateMember } from "@/features/bot/members/updateMember";
import { deleteReactions } from "@/features/bot/reactions/deleteReactions";
import { getIntegration } from "@/features/integrations/actions/getIntegration";
import { updateIntegration } from "@/features/integrations/actions/updateIntegration";
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
      await mergeMember({ web, user: event.user, workspace_id });
      break;
    }

    case "team_join": {
      console.log(event);
      break;
    }

    case "member_left_channel": {
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

    case "channel_left": {
      console.log(event);
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

        const rMember = await mergeMember({ web, user, workspace_id });
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
            ts,
            previous_text: previous_text ?? "",
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

          await deleteReactions({ channel_id: channel.id, ts: deleted_ts });
          await deleteActivity({ channel_id: channel.id, ts: deleted_ts });
          break;
        }
      }
      break;
    }

    case "reaction_added": {
      const { user, item, reaction } = event;
      const { channel: channel_id, ts } = item;
      const rMember = await mergeMember({ web, user, workspace_id });
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
      const { reaction, item } = event;
      const { ts, channel: channel_id } = item;

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

      await deleteActivity({ channel_id: channel.id, message: reaction, ts });
      break;
    }

    case "user_change": {
      const { profile, id } = event.user;
      const { first_name, last_name, title, phone, image_1024 } = profile;

      await updateMember({
        slack_id: id,
        first_name,
        last_name,
        job_title: title,
        phone,
        avatar_url: image_1024,
      });
      break;
    }
  }

  return NextResponse.json({ success: true });
});
