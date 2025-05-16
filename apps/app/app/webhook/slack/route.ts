import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { deleteActivity } from "@conquest/clickhouse/activities/deleteActivity";
import { deleteManyActivities } from "@conquest/clickhouse/activities/deleteManyActivities";
import { getActivity } from "@conquest/clickhouse/activities/getActivity";
import { updateActivity } from "@conquest/clickhouse/activities/updateActivity";
import { getActivityTypeByKey } from "@conquest/clickhouse/activity-types/getActivityTypeByKey";
import { createChannel } from "@conquest/clickhouse/channels/createChannel";
import { deleteChannel } from "@conquest/clickhouse/channels/deleteChannel";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import { updateChannel } from "@conquest/clickhouse/channels/updateChannel";
import { client } from "@conquest/clickhouse/client";
import { createMember } from "@conquest/clickhouse/members/createMember";
import { deleteMember } from "@conquest/clickhouse/members/deleteMember";
import { getMember } from "@conquest/clickhouse/members/getMember";
import { updateMember } from "@conquest/clickhouse/members/updateMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { updateProfile } from "@conquest/clickhouse/profiles/updateProfile";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
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

const escapeSqlString = (str: string): string => {
  return str.replace(/'/g, "''");
};

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

  const integration = await getIntegration({ externalId: team_id });

  if (!integration) return NextResponse.json({ status: 200 });

  const slack = SlackIntegrationSchema.parse(integration);
  const { workspaceId } = slack;
  const { accessToken, accessTokenIv } = slack.details;

  const token = await decrypt({
    accessToken,
    iv: accessTokenIv,
  });

  if (!workspaceId || !token) return NextResponse.json({ status: 200 });

  const web = new WebClient(token);

  switch (type) {
    case "app_uninstalled": {
      await updateIntegration({
        id: integration.id,
        status: "DISCONNECTED",
        workspaceId,
      });

      return NextResponse.json({ status: 200 });
    }

    case "channel_created": {
      const { name, id } = event.channel;

      await createChannel({
        externalId: id,
        name,
        source: "Slack",
        workspaceId,
      });

      await web.conversations.join({ channel: id });

      return NextResponse.json({ status: 200 });
    }

    case "channel_rename": {
      const { name, id } = event.channel;

      const channel = await getChannel({
        externalId: id,
        workspaceId,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      await updateChannel({ id: channel.id, name });
      break;
    }

    case "channel_deleted": {
      const { channel } = event;
      await deleteChannel({ externalId: channel, workspaceId });

      return NextResponse.json({ status: 200 });
    }

    case "reaction_added": {
      const { user, item, reaction } = event;
      const { channel: channel_id, ts } = item;

      const profile = await getProfile({
        externalId: user,
        workspaceId,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      const channel = await getChannel({
        externalId: channel_id,
        workspaceId,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      await createActivity({
        activityTypeKey: "slack:reaction",
        message: reaction,
        reactTo: ts,
        memberId: profile.memberId,
        channelId: channel.id,
        source: "Slack",
        workspaceId,
      });

      return NextResponse.json({ status: 200 });
    }

    case "reaction_removed": {
      const { user, reaction, item } = event;
      const { ts, channel: channel_id } = item;

      const profile = await getProfile({
        externalId: user,
        workspaceId,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      const channel = await getChannel({
        externalId: channel_id,
        workspaceId,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      await client.query({
        query: `
          ALTER TABLE activity
          DELETE WHERE memberId = '${profile.memberId}'
          AND channelId = '${channel.id}' 
          AND reactTo = '${ts}' 
          AND message = '${escapeSqlString(reaction)}'
          AND workspaceId = '${workspaceId}'
        `,
      });

      return NextResponse.json({ status: 200 });
    }

    case "user_change": {
      console.log("user_change", event);
      const { id: externalId, deleted } = event.user;

      const profile = await getProfile({
        externalId,
        workspaceId,
      });

      console.log("profile", profile);

      if (!profile) return NextResponse.json({ status: 200 });

      if (deleted) {
        await deleteMember({ id: profile.memberId });
        break;
      }

      const member = await getMember({ id: profile.memberId });

      console.log("member", member);

      if (!member) return NextResponse.json({ status: 200 });

      const { user } = await web.users.info({ user: externalId });
      const {
        first_name,
        last_name,
        real_name,
        email,
        phone,
        image_1024,
        title,
      } = user?.profile ?? {};

      console.log("user", user);

      if (!email) return NextResponse.json({ status: 200 });

      const language = user?.locale?.split("-")[0] ?? "";
      const country = user?.locale?.split("-")[1] ?? "";

      const emails = [...new Set([...member.emails, email])];
      const phones = [...new Set([...member.phones, phone])].filter(
        (p): p is string => Boolean(p),
      );

      await updateMember({
        ...member,
        firstName: first_name ?? member.firstName,
        lastName: last_name ?? member.lastName,
        primaryEmail: email,
        emails,
        phones,
        avatarUrl: image_1024 ?? member.avatarUrl,
        jobTitle: title ?? member.jobTitle,
        country,
        language,
      });

      await updateProfile({
        id: profile.id,
        attributes: {
          source: "Slack",
          realName: real_name ?? "",
        },
      });

      return NextResponse.json({ status: 200 });
    }

    case "team_join": {
      console.log("team_join", event);
      const { user } = event;
      const { id, is_bot } = user;

      if (is_bot) return NextResponse.json({ status: 200 });

      const { user: info } = await web.users.info({ user: id });
      const { locale } = info ?? {};

      const { profile } = info ?? {};
      const {
        first_name,
        last_name,
        real_name,
        email,
        phone,
        image_1024,
        title,
      } = profile ?? {};

      const language = locale
        ? ISO6391.getName(locale.split("-")[0] ?? "")
        : "";
      const country = locale ? locale.split("-")[1] : "";

      const existingProfile = await getProfile({
        externalId: id,
        workspaceId,
      });

      if (!existingProfile) {
        const createdMember = await createMember({
          firstName: first_name,
          lastName: last_name,
          primaryEmail: email,
          emails: email ? [email] : [],
          phones: phone ? [phone] : [],
          avatarUrl: image_1024,
          jobTitle: title,
          language,
          country,
          source: "Slack",
          workspaceId,
        });

        await createProfile({
          externalId: id,
          attributes: {
            source: "Slack",
            realName: real_name ?? "",
          },
          memberId: createdMember.id,
          workspaceId,
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
              externalId: ts,
              workspaceId,
            });

            if (!activityWithType) return NextResponse.json({ status: 200 });

            const result = await getActivityTypeByKey({
              key: thread_ts ? "slack:reply" : "slack:message",
              workspaceId,
            });

            if (!result) return NextResponse.json({ status: 200 });

            const { activityType, ...activity } = activityWithType;

            await updateActivity({
              ...activity,
              activityTypeId: activityType.id,
              message: text ? escapeSqlString(text) : "",
              replyTo: thread_ts ?? "",
            });

            return NextResponse.json({ status: 200 });
          }

          case "message_deleted": {
            const { deleted_ts } = event as MessageDeletedEvent;

            const channel = await getChannel({
              externalId: channel_id,
              workspaceId,
            });

            if (!channel) return NextResponse.json({ status: 200 });

            await deleteManyActivities({
              channelId: channel.id,
              reactTo: deleted_ts,
            });

            await deleteActivity({
              externalId: deleted_ts,
              channelId: channel.id,
              workspaceId,
            });

            return NextResponse.json({ status: 200 });
          }
        }

        return NextResponse.json({ status: 200 });
      }

      const profile = await getProfile({
        externalId: user,
        workspaceId,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      const channel = await getChannel({
        externalId: channel_id,
        workspaceId,
      });

      if (!channel) return NextResponse.json({ status: 200 });

      await createActivity({
        externalId: ts,
        activityTypeKey: thread_ts ? "slack:reply" : "slack:message",
        message: text ? escapeSqlString(text) : "",
        replyTo: thread_ts ?? "",
        memberId: profile.memberId,
        channelId: channel.id,
        source: "Slack",
        workspaceId,
      });

      if (!subtype) return NextResponse.json({ status: 200 });

      return NextResponse.json({ status: 200 });
    }
  }

  return NextResponse.json({ status: 200 });
}
