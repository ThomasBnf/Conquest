import { decrypt } from "@conquest/db/lib/decrypt";
import { prisma } from "@conquest/db/prisma";
import { createActivity } from "@conquest/db/queries/activity/createActivity";
import { deleteActivity } from "@conquest/db/queries/activity/deleteActivity";
import { updateActivity } from "@conquest/db/queries/activity/updateActivity";
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
import {
  type GenericMessageEvent,
  type MessageChangedEvent,
  type MessageDeletedEvent,
  type SlackEvent,
  WebClient,
} from "@slack/web-api";
import ISO6391 from "iso-639-1";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const WebhookSchema = z.object({
  token: z.string(),
  api_app_id: z.string(),
  team_id: z.string(),
  event: z.custom<SlackEvent>(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.challenge) {
    return NextResponse.json({ challenge: body.challenge });
  }

  const isParsed = WebhookSchema.safeParse(body);

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

  const integration = await getIntegration({ external_id: team_id });

  if (!integration) return NextResponse.json({ status: 200 });

  const slackIntegration = SlackIntegrationSchema.parse(integration);

  const { workspace_id } = slackIntegration;
  const { access_token, access_token_iv } = slackIntegration.details;

  const token = await decrypt({
    access_token,
    iv: access_token_iv,
  });

  if (!workspace_id || !token) return NextResponse.json({ status: 200 });

  const web = new WebClient(token);

  switch (type) {
    case "app_uninstalled": {
      await updateIntegration({
        id: integration.id,
        status: "DISCONNECTED",
      });

      return NextResponse.json({ status: 200 });
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

      return NextResponse.json({ status: 200 });
    }

    case "channel_rename": {
      const { name, id } = event.channel;
      await updateChannel({ external_id: id, name, workspace_id });
      break;
    }

    case "channel_deleted": {
      const { channel } = event;
      await deleteChannel({ external_id: channel, workspace_id });

      return NextResponse.json({ status: 200 });
    }

    case "reaction_added": {
      const { user, item, reaction } = event;
      const { channel: channel_id, ts } = item;

      const profile = await getProfile({
        external_id: user,
        workspace_id,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      const channel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      await createActivity({
        activity_type_key: "slack:reaction",
        message: reaction,
        react_to: ts,
        member_id: profile.member_id,
        channel_id: channel.id,
        source: "SLACK",
        workspace_id,
      });

      return NextResponse.json({ status: 200 });
    }

    case "reaction_removed": {
      const { user, reaction, item } = event;
      const { ts, channel: channel_id } = item;

      const profile = await getProfile({
        external_id: user,
        workspace_id,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      const channel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });

      if (!channel) return NextResponse.json({ status: 200 });

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

      return NextResponse.json({ status: 200 });
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

      return NextResponse.json({ status: 200 });
    }

    case "team_join": {
      const { user } = event;
      const { id, is_bot } = user;

      if (is_bot) return NextResponse.json({ status: 200 });

      const { user: info } = await web.users.info({ user: id });
      const { locale } = info ?? {};

      const { profile } = info ?? {};
      const { first_name, last_name, email, phone, image_1024, title } =
        profile ?? {};

      const language = locale
        ? ISO6391.getName(locale.split("-")[0] ?? "")
        : null;
      const country = locale ? locale.split("-")[1] : null;

      const existingProfile = await getProfile({
        external_id: id,
        workspace_id,
      });

      if (!existingProfile) {
        const createdMember = await createMember({
          data: {
            first_name,
            last_name,
            primary_email: email,
            phones: phone ? [phone] : [],
            avatar_url: image_1024,
            job_title: title === "" ? null : title,
            language,
            country,
          },
          source: "SLACK",
          workspace_id,
        });

        await upsertProfile({
          external_id: id,
          attributes: {
            source: "SLACK",
          },
          member_id: createdMember.id,
          workspace_id,
        });
      }

      return NextResponse.json({ status: 200 });
    }

    case "message": {
      const {
        user,
        ts,
        text,
        thread_ts,
        channel: channel_id,
        subtype,
      } = event as GenericMessageEvent;

      if (subtype) {
        switch (subtype) {
          case "message_changed": {
            const { message } = event as MessageChangedEvent;
            const { ts, thread_ts, text } = message as GenericMessageEvent;

            await updateActivity({
              external_id: ts,
              activity_type_key: thread_ts ? "slack:reply" : "slack:message",
              message: text ?? "",
              reply_to: thread_ts ?? null,
              workspace_id,
            });

            return NextResponse.json({ status: 200 });
          }

          case "message_deleted": {
            const { deleted_ts } = event as MessageDeletedEvent;

            const channel = await getChannel({
              external_id: channel_id,
              workspace_id,
            });

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

            return NextResponse.json({ status: 200 });
          }
        }

        return NextResponse.json({ status: 200 });
      }

      const profile = await getProfile({
        external_id: user,
        workspace_id,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      const channel = await getChannel({
        external_id: channel_id,
        workspace_id,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      await createActivity({
        external_id: ts,
        activity_type_key: thread_ts ? "slack:reply" : "slack:message",
        message: text ?? "",
        reply_to: thread_ts ?? null,
        member_id: profile.member_id,
        channel_id: channel.id,
        source: "SLACK",
        workspace_id,
      });

      if (!subtype) return NextResponse.json({ status: 200 });

      return NextResponse.json({ status: 200 });
    }
  }

  return NextResponse.json({ status: 200 });
}
