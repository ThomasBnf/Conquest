import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { deleteActivity } from "@conquest/clickhouse/activities/deleteActivity";
import { deleteManyActivities } from "@conquest/clickhouse/activities/deleteManyActivities";
import { getActivity } from "@conquest/clickhouse/activities/getActivity";
import { updateActivity } from "@conquest/clickhouse/activities/updateActivity";
import { getActivityTypeByKey } from "@conquest/clickhouse/activity-types/getActivityTypeByKey";
import { client } from "@conquest/clickhouse/client";
import { createMember } from "@conquest/clickhouse/members/createMember";
import { deleteMember } from "@conquest/clickhouse/members/deleteMember";
import { getMember } from "@conquest/clickhouse/members/getMember";
import { updateMember } from "@conquest/clickhouse/members/updateMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { createChannel } from "@conquest/db/channels/createChannel";
import { deleteChannel } from "@conquest/db/channels/deleteChannel";
import { getChannel } from "@conquest/db/channels/getChannel";
import { updateChannel } from "@conquest/db/channels/updateChannel";
import { updateIntegration } from "@conquest/db/integrations//updateIntegration";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
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

  const slack = SlackIntegrationSchema.parse(integration);
  const { workspace_id } = slack;
  const { access_token, access_token_iv } = slack.details;

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
        workspace_id,
      });

      return NextResponse.json({ status: 200 });
    }

    case "channel_created": {
      const { name, id } = event.channel;
      await createChannel({
        external_id: id,
        name,
        source: "Slack",
        workspace_id,
      });

      await web.conversations.join({ channel: id });

      return NextResponse.json({ status: 200 });
    }

    case "channel_rename": {
      const { name, id } = event.channel;
      const channel = await getChannel({
        external_id: id,
        workspace_id,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      await updateChannel({ ...channel, name });
      break;
    }

    case "channel_deleted": {
      const { channel } = event;
      await deleteChannel({ id: channel });

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
        source: "Slack",
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

      await client.query({
        query: `
          ALTER TABLE activity
          DELETE WHERE member_id = '${profile.member_id}'
          AND channel_id = '${channel.id}' 
          AND react_to = '${ts}' 
          AND message = '${reaction}'
          AND workspace_id = '${workspace_id}'
        `,
      });

      return NextResponse.json({ status: 200 });
    }

    case "user_change": {
      const { id: external_id, deleted } = event.user;

      const profile = await getProfile({
        external_id,
        workspace_id,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      if (deleted) {
        await deleteMember({ id: profile.member_id });
        break;
      }

      const member = await getMember({ id: profile.member_id });

      if (!member) return NextResponse.json({ status: 200 });

      const { user } = await web.users.info({ user: external_id });
      const { first_name, last_name, email, phone, image_1024, title } =
        user?.profile ?? {};

      if (!email) return NextResponse.json({ status: 200 });

      const language = user?.locale?.split("-")[0] ?? "";
      const country = user?.locale?.split("-")[1] ?? "";

      await updateMember({
        ...member,
        first_name: first_name ?? member.first_name,
        last_name: last_name ?? member.last_name,
        primary_email: email,
        phones: phone ? [phone] : member.phones,
        avatar_url: image_1024 ?? member.avatar_url,
        job_title: title ?? member.job_title,
        country,
        language,
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
        : "";
      const country = locale ? locale.split("-")[1] : "";

      const existingProfile = await getProfile({
        external_id: id,
        workspace_id,
      });

      if (!existingProfile) {
        const createdMember = await createMember({
          first_name,
          last_name,
          primary_email: email,
          phones: phone ? [phone] : [],
          avatar_url: image_1024,
          job_title: title,
          language,
          country,
          source: "Slack",
          workspace_id,
        });

        await createProfile({
          external_id: id,
          attributes: {
            source: "Slack",
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

            const activityWithType = await getActivity({
              external_id: ts,
              workspace_id,
            });

            if (!activityWithType) return NextResponse.json({ status: 200 });

            const activityType = await getActivityTypeByKey({
              key: thread_ts ? "slack:reply" : "slack:message",
              workspace_id,
            });

            if (!activityType) return NextResponse.json({ status: 200 });

            const { activity_type, ...activity } = activityWithType;

            await updateActivity({
              ...activity,
              activity_type_id: activityType.id,
              message: text ?? "",
              reply_to: thread_ts ?? "",
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

            await deleteManyActivities({
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
        reply_to: thread_ts ?? "",
        member_id: profile.member_id,
        channel_id: channel.id,
        source: "Slack",
        workspace_id,
      });

      if (!subtype) return NextResponse.json({ status: 200 });

      return NextResponse.json({ status: 200 });
    }
  }

  return NextResponse.json({ status: 200 });
}
