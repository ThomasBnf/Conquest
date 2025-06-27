import { createActivity } from "@conquest/db/activity/createActivity";
import { deleteActivity } from "@conquest/db/activity/deleteActivity";
import { deleteManyActivities } from "@conquest/db/activity/deleteManyActivities";
import { getActivity } from "@conquest/db/activity/getActivity";
import { updateActivity } from "@conquest/db/activity/updateActivity";
import { createChannel } from "@conquest/db/channel/createChannel";
import { deleteChannel } from "@conquest/db/channel/deleteChannel";
import { getChannel } from "@conquest/db/channel/getChannel";
import { updateChannel } from "@conquest/db/channel/updateChannel";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { createMember } from "@conquest/db/member/createMember";
import { deleteMember } from "@conquest/db/member/deleteMember";
import { getMember } from "@conquest/db/member/getMember";
import { updateMember } from "@conquest/db/member/updateMember";
import { prisma } from "@conquest/db/prisma";
import { createProfile } from "@conquest/db/profile/createProfile";
import { getProfile } from "@conquest/db/profile/getProfile";
import { updateProfile } from "@conquest/db/profile/updateProfile";
import { decrypt } from "@conquest/db/utils/decrypt";
import { env } from "@conquest/env";
import { triggerWorkflows } from "@conquest/trigger/tasks/triggerWorkflows";
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
  console.log(body);

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

      await prisma.activity.deleteMany({
        where: {
          memberId: profile.memberId,
          channelId: channel.id,
          reactTo: ts,
          message: reaction,
          workspaceId,
        },
      });

      return NextResponse.json({ status: 200 });
    }

    case "user_change": {
      const { id: externalId, deleted } = event.user;

      const profile = await getProfile({
        externalId,
        workspaceId,
      });

      if (!profile) return NextResponse.json({ status: 200 });

      if (deleted) {
        await deleteMember({ id: profile.memberId });
        break;
      }

      const member = await getMember({ id: profile.memberId });

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

        await triggerWorkflows.trigger({
          trigger: "member-created",
          member: createdMember,
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

            const { activityType, ...activity } = activityWithType;

            await updateActivity({
              ...activity,
              activityTypeKey: thread_ts ? "slack:reply" : "slack:message",
              message: text ?? null,
              replyTo: thread_ts ?? null,
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
        message: text ?? null,
        replyTo: thread_ts ?? null,
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
