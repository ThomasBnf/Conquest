import { prisma } from "@conquest/db/prisma";
import { createActivity } from "@conquest/db/queries/activity/createActivity";
import { deleteActivity } from "@conquest/db/queries/activity/deleteActivity";
import { updateActivity } from "@conquest/db/queries/activity/updateActivity";
import { upsertActivity } from "@conquest/db/queries/activity/upsertActivity";
import { createChannel } from "@conquest/db/queries/channel/createChannel";
import { deleteChannel } from "@conquest/db/queries/channel/deleteChannel";
import { getChannel } from "@conquest/db/queries/channel/getChannel";
import { updateChannel } from "@conquest/db/queries/channel/updateChannel";
import { getIntegration } from "@conquest/db/queries/integration/getIntegration";
import { updateIntegration } from "@conquest/db/queries/integration/updateIntegration";
import { createMember } from "@conquest/db/queries/member/createMember";
import { deleteMember } from "@conquest/db/queries/member/deleteMember";
import { upsertMember } from "@conquest/db/queries/member/upsertMember";
import { getProfile } from "@conquest/db/queries/profile/getProfile";
import { upsertProfile } from "@conquest/db/queries/profile/upsertProfile";
import { deleteListReactions } from "@conquest/db/queries/slack/deleteListReactions";
import { env } from "@conquest/env";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { SlackAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import {
  type GenericMessageEvent,
  type SlackEvent,
  WebClient,
} from "@slack/web-api";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PostSchema = z.object({
  token: z.string(),
  api_app_id: z.string(),
  team_id: z.string(),
  event: z.custom<SlackEvent>(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const isParsed = PostSchema.safeParse(body);
  if (!isParsed.success) return NextResponse.json({ status: 200 });

  const { token: slack_token, api_app_id, team_id, event } = isParsed.data;

  if (!event || typeof event !== "object") {
    return NextResponse.json({ status: 200 });
  }

  if (
    slack_token !== env.SLACK_VERIFICATION_TOKEN &&
    api_app_id !== env.SLACK_APP_ID
  ) {
    return NextResponse.json({ status: 200 });
  }

  const { type } = event;

  const integration = await getIntegration({
    external_id: team_id,
    status: "CONNECTED",
  });

  if (!integration) return NextResponse.json({ status: 200 });

  const slackIntegration = SlackIntegrationSchema.parse(integration);

  const { workspace_id } = slackIntegration;
  const { token } = slackIntegration.details;

  if (!workspace_id || !token) return NextResponse.json({ status: 200 });

  const web = new WebClient(token);

  switch (type) {
    case "app_uninstalled": {
      await updateIntegration({
        id: integration.id,
        status: "DISCONNECTED",
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
      await updateChannel({ external_id: id, name, workspace_id });
      break;
    }

    case "channel_deleted": {
      const { channel } = event;
      await deleteChannel({ external_id: channel, workspace_id });
      break;
    }

    case "message": {
      const { channel: channel_id, subtype } = event;

      const channel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      switch (subtype) {
        case undefined: {
          break;
        }

        case "file_share": {
          break;
        }

        case "message_changed": {
          const { text, ts, thread_ts } = event.message as GenericMessageEvent;

          await updateActivity({
            external_id: ts,
            activity_type_key: thread_ts ? "slack:reply" : "slack:message",
            message: text ?? "",
            reply_to: thread_ts ?? null,
            workspace_id,
          });

          break;
        }

        case "message_deleted": {
          const { deleted_ts } = event;

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

      const channel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      const profile = await getProfile({
        external_id: user,
        workspace_id,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      await createActivity({
        activity_type_key: "slack:reaction",
        member_id: profile.member_id,
        channel_id: channel.id,
        message: reaction,
        react_to: ts,
        source: "SLACK",
        workspace_id,
      });

      break;
    }

    case "reaction_removed": {
      const { user, reaction, item } = event;
      const { ts, channel: channel_id } = item;

      const channel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      const profile = await getProfile({
        external_id: user,
        workspace_id,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      await prisma.activity.deleteMany({
        where: {
          member_id: profile.member_id,
          channel_id: channel.id,
          AND: [
            {
              react_to: ts,
            },
            {
              message: reaction,
            },
          ],
        },
      });

      break;
    }

    case "member_joined_channel": {
      const { user: id, inviter, event_ts } = event;

      const { user } = await web.users.info({ user: id });
      const { first_name, last_name, email, phone, image_1024, title } =
        user?.profile ?? {};

      if (!email) return NextResponse.json({ status: 200 });

      const existingProfile = await getProfile({
        external_id: id,
        workspace_id,
      });

      const language = user?.locale?.split("-")[0];
      const country = user?.locale?.split("-")[1];

      let invitee: Member | null = null;

      if (!existingProfile) {
        invitee = await createMember({
          data: {
            first_name,
            last_name,
            primary_email: email,
            phones: phone ? [phone] : [],
            avatar_url: image_1024,
            country,
            language,
            job_title: title,
          },
          source: "SLACK",
          workspace_id,
        });

        const attributes = SlackAttributesSchema.parse({
          source: "SLACK",
        });

        await upsertProfile({
          external_id: id,
          attributes,
          member_id: invitee.id,
          workspace_id,
        });

        return NextResponse.json({ status: 200 });
      }

      invitee = await upsertMember({
        id: existingProfile.member_id,
        data: {
          first_name,
          last_name,
          primary_email: email,
          phones: phone ? [phone] : [],
          avatar_url: image_1024,
          country,
          language,
          job_title: title,
        },
        source: "SLACK",
        workspace_id,
      });

      const member = await getProfile({
        external_id: inviter ?? "",
        workspace_id,
      });

      if (!member) return NextResponse.json({ status: 200 });

      await upsertActivity({
        external_id: event_ts,
        activity_type_key: "slack:invitation",
        message: "",
        invite_to: member.id,
        created_at: new Date(Number.parseFloat(event_ts) * 1000),
        updated_at: new Date(Number.parseFloat(event_ts) * 1000),
        member_id: member.id,
        source: "SLACK",
        workspace_id,
      });

      break;
    }

    case "user_change": {
      const { id, deleted } = event.user;

      const profile = await getProfile({
        external_id: id,
        workspace_id,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      if (deleted) {
        await deleteMember({ id: profile.member_id });
        break;
      }

      const { user } = await web.users.info({ user: id });
      const { first_name, last_name, email, phone, image_1024, title } =
        user?.profile ?? {};

      if (!email) return NextResponse.json({ status: 200 });

      const language = user?.locale?.split("-")[0];
      const country = user?.locale?.split("-")[1];

      await upsertMember({
        id,
        data: {
          first_name,
          last_name,
          primary_email: email,
          phones: phone ? [phone] : [],
          avatar_url: image_1024,
          country,
          language,
          job_title: title,
        },
        source: "SLACK",
        workspace_id,
      });

      break;
    }
  }

  return NextResponse.json({ status: 200 });
}
