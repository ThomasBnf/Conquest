import { sleep } from "@/utils/sleep";
import { getActivityTypeByKey } from "@conquest/clickhouse/activity-type/getActivityTypeByKey";
import { createActivity } from "@conquest/clickhouse/activity/createActivity";
import { deleteActivity } from "@conquest/clickhouse/activity/deleteActivity";
import { getActivity } from "@conquest/clickhouse/activity/getActivity";
import { updateActivity } from "@conquest/clickhouse/activity/updateActivity";
import { upsertActivity } from "@conquest/clickhouse/activity/upsertActivity";
import { createChannel } from "@conquest/clickhouse/channel/createChannel";
import { deleteChannel } from "@conquest/clickhouse/channel/deleteChannel";
import { getChannel } from "@conquest/clickhouse/channel/getChannel";
import { updateChannel } from "@conquest/clickhouse/channel/updateChannel";
import { client } from "@conquest/clickhouse/client";
import { createMember } from "@conquest/clickhouse/member/createMember";
import { deleteMember } from "@conquest/clickhouse/member/deleteMember";
import { getMember } from "@conquest/clickhouse/member/getMember";
import { updateMember } from "@conquest/clickhouse/member/updateMember";
import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { deleteProfile } from "@conquest/clickhouse/profile/deleteProfile";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { updateProfile } from "@conquest/clickhouse/profile/updateProfile";
import { discourseClient } from "@conquest/db/discourse";
import { prisma } from "@conquest/db/prisma";
import { createTag } from "@conquest/db/tags/createTag";
import { listTags } from "@conquest/db/tags/listTags";
import { decrypt } from "@conquest/db/utils/decrypt";
import { env } from "@conquest/env";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { DiscourseWebhook } from "@conquest/zod/types/discourse";
import { type NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const body = JSON.parse(rawBody);

  if (body.ping) {
    return NextResponse.json({ status: 200 });
  }

  const integration = await checkSignature(request, rawBody);

  if (!integration) return NextResponse.json({ status: 200 });

  const event = request.headers.get("X-Discourse-Event");

  const { category, topic, post, user, like, user_badge, solved } =
    body as DiscourseWebhook;
  const { workspaceId } = integration;

  if (topic && (event === "topic_created" || event === "topic_recovered")) {
    const { id, created_by, category_id, title } = topic;
    const { id: user_id, username } = created_by;

    if (user_id < 0) return NextResponse.json({ status: 200 });

    const profile = await getProfile({
      username,
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const channel = await getChannel({
      externalId: String(category_id),
      workspaceId,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    await upsertActivity({
      externalId: `t/${id}`,
      activityTypeKey: "discourse:topic",
      title,
      message: "",
      memberId: profile.memberId,
      channelId: channel.id,
      source: "Discourse",
      workspaceId,
    });
  }

  if (topic && event === "topic_edited") {
    await sleep(1000);
    const { id, title } = topic;

    const activity = await getActivity({
      externalId: `t/${id}`,
      workspaceId,
    });

    if (!activity) return NextResponse.json({ status: 200 });

    const { activityType, ...data } = activity;

    await updateActivity({
      ...data,
      activityTypeId: activityType.id,
      title,
    });
  }

  if (topic && event === "topic_destroyed") {
    await sleep(1000);
    const { id } = topic;

    await deleteActivity({
      externalId: `t/${id}`,
      workspaceId,
    });

    await client.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE reactTo LIKE 't/${id}'
        OR reply_to LIKE 't/${id}'
      `,
    });
  }

  if (post && (event === "post_created" || event === "post_recovered")) {
    await sleep(2000);

    const {
      id,
      username,
      post_number,
      category_id,
      user_id,
      topic_id,
      reply_to_post_number,
      reply_to_user,
    } = post;

    if (user_id < 0) return NextResponse.json({ status: 200 });

    const profile = await getProfile({
      username,
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const channel = await getChannel({
      externalId: String(category_id),
      workspaceId,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    if (post_number === 1) {
      const activity = await getActivity({
        externalId: `t/${topic_id}`,
        workspaceId,
      });

      if (!activity) return NextResponse.json({ status: 200 });

      const result = await getActivityTypeByKey({
        key: "discourse:topic",
        workspaceId,
      });

      if (!result) return NextResponse.json({ status: 200 });

      const { activityType, ...data } = activity;

      await updateActivity({
        ...data,
        activityTypeId: activityType.id,
        message: post.cooked,
      });

      return NextResponse.json({ status: 200 });
    }

    if (reply_to_user && reply_to_post_number) {
      await createActivity({
        externalId: `p/${id}`,
        activityTypeKey: "discourse:reply",
        message: post.cooked,
        replyTo: `t/${topic_id}/${reply_to_post_number}`,
        memberId: profile.memberId,
        channelId: channel.id,
        source: "Discourse",
        workspaceId,
      });

      return NextResponse.json({ status: 200 });
    }

    await createActivity({
      externalId: `p/${id}`,
      activityTypeKey: "discourse:reply",
      replyTo: `t/${topic_id}`,
      message: post.cooked,
      memberId: profile.memberId,
      channelId: channel.id,
      source: "Discourse",
      workspaceId,
    });
  }

  if (post && event === "post_edited") {
    await sleep(1000);
    const { id, topic_id, post_number } = post;

    const activity = await getActivity({
      externalId: post_number === 1 ? `t/${topic_id}` : `p/${id}`,
      workspaceId,
    });

    if (!activity) return NextResponse.json({ status: 200 });

    const result = await getActivityTypeByKey({
      key: post_number === 1 ? "discourse:topic" : "discourse:reply",
      workspaceId,
    });

    if (!result) return NextResponse.json({ status: 200 });

    const { activityType, ...data } = activity;

    await updateActivity({
      ...data,
      activityTypeId: activityType.id,
      message: post.cooked,
    });
  }

  if (post && event === "post_destroyed") {
    await sleep(1000);
    const { id, username } = post;

    const profile = await getProfile({
      username,
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    await deleteActivity({
      externalId: `p/${id}`,
      workspaceId,
    });
  }

  if (like && event === "post_liked") {
    const { post, user } = like;
    const { category_id, topic_id, post_number, reactions } = post;
    const { username } = user;

    const profile = await getProfile({
      username,
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const channel = await getChannel({
      externalId: String(category_id),
      workspaceId,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    await createActivity({
      activityTypeKey: "discourse:reaction",
      message: reactions?.[0]?.id ?? "like",
      reactTo: `t/${topic_id}/${post_number}`,
      memberId: profile.memberId,
      channelId: channel.id,
      source: "Discourse",
      workspaceId,
    });
  }

  if (user && event === "user_confirmed_email") {
    const { id, name, username, email, avatar_template, invited_by } = user;

    const [firstName, lastName] = name.split(" ");
    const avatarUrl = avatar_template.replace("{size}", "500");

    const member = await createMember({
      firstName,
      lastName,
      primaryEmail: email,
      avatarUrl,
      source: "Discourse",
      workspaceId,
      createdAt: new Date(),
    });

    await createProfile({
      externalId: String(id),
      memberId: member.id,
      attributes: {
        source: "Discourse",
        username,
      },
      workspaceId,
    });

    const inviter = await getProfile({
      username: String(invited_by.username),
      workspaceId,
    });

    if (!inviter) return NextResponse.json({ status: 200 });

    await createActivity({
      activityTypeKey: "discourse:invite",
      message: "invitation accepted",
      inviteTo: member.id,
      memberId: inviter.memberId,
      source: "Discourse",
      workspaceId,
    });
  }

  if (user && event === "user_updated") {
    const {
      id,
      name,
      username,
      email,
      secondary_emails,
      avatar_template,
      title,
    } = user;

    const [firstName, lastName] = name.split(" ");
    const avatarUrl = avatar_template.replace("{size}", "500");

    const profile = await getProfile({
      username,
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const member = await getMember({
      id: profile.memberId,
    });

    if (!member) return NextResponse.json({ status: 200 });

    await updateMember({
      ...member,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      primaryEmail: email,
      emails: [...(member.emails ?? []), email, ...(secondary_emails ?? [])],
      avatarUrl,
      jobTitle: title ?? "",
      createdAt: new Date(),
      source: "Discourse",
      workspaceId,
    });

    await updateProfile({
      id: profile.id,
      externalId: String(id),
      memberId: member.id,
      attributes: {
        username,
        source: "Discourse",
      },
      workspaceId,
    });
  }

  if (user && event === "user_destroyed") {
    const { username } = user;

    const profile = await getProfile({
      username,
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    await deleteProfile({
      username,
      workspaceId,
    });

    await deleteMember({
      id: profile.memberId,
    });
  }

  if (user && event === "user_logged_in") {
    const { username } = user;
    const profile = await getProfile({
      username,
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    await createActivity({
      activityTypeKey: "discourse:login",
      message: "login",
      memberId: profile.memberId,
      source: "Discourse",
      workspaceId,
    });
  }

  if (category && event === "category_created") {
    const { id, name, parent_category_id } = category;

    let channel_name = name;

    if (parent_category_id) {
      const parent = await getChannel({
        externalId: String(parent_category_id),
        workspaceId,
      });

      channel_name = `${parent?.name} - ${name}`;
    }

    await createChannel({
      externalId: String(id),
      name: channel_name,
      source: "Discourse",
      workspaceId,
    });
  }

  if (category && event === "category_updated") {
    const { id, name, parent_category_id } = category;

    let channel_name = name;

    const channel = await getChannel({
      externalId: String(id),
      workspaceId,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    if (parent_category_id) {
      const parent = await getChannel({
        externalId: String(parent_category_id),
        workspaceId,
      });

      channel_name = `${parent?.name} - ${name}`;
    }

    await updateChannel({
      externalId: String(id),
      name: channel_name,
      workspaceId,
    });
  }

  if (category && event === "category_destroyed") {
    const { id } = category;

    const channel = await getChannel({
      externalId: String(id),
      workspaceId,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    await client.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE channelId = '${channel.id}'
        AND workspaceId = '${workspaceId}'
      `,
    });

    await deleteChannel({
      externalId: String(id),
      workspaceId,
    });
  }

  if (user_badge && event === "user_badge_granted") {
    const { badge_id, user_id } = user_badge;

    const profile = await getProfile({
      externalId: String(user_id),
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const member = await getMember({
      id: profile.memberId,
    });

    if (!member) return NextResponse.json({ status: 200 });

    const tags = await listTags({ workspaceId });
    const existingTag = tags.find((tag) => tag.externalId === String(badge_id));

    if (existingTag) {
      await updateMember({
        ...member,
        tags: [...(member.tags ?? []), existingTag.id],
      });

      return NextResponse.json({ status: 200 });
    }

    const { communityUrl, apiKey, apiKeyIv } = integration.details;

    const decryptedApiKey = await decrypt({
      accessToken: apiKey,
      iv: apiKeyIv,
    });

    const client = discourseClient({
      communityUrl,
      apiKey: decryptedApiKey,
    });

    const { badges } = await client.adminListBadges();
    const badge = badges.find((badge) => badge.id === badge_id);

    if (!badge) return NextResponse.json({ status: 200 });

    const { id: badgeId, name, badge_type_id } = badge;

    const colorMap = {
      "1": "#E7C200",
      "2": "#CD7F31",
      "3": "#C0C0C0",
    } as const;

    const color = colorMap[String(badge_type_id) as keyof typeof colorMap];

    const newTag = {
      id: uuid(),
      externalId: null,
      name,
      color,
      source: "Discourse" as const,
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createTag(newTag);

    await updateMember({
      ...member,
      tags: [...(member?.tags ?? []), newTag.id],
    });
  }

  if (user_badge && event === "user_badge_revoked") {
    const { badge_id, user_id } = user_badge;

    const profile = await getProfile({
      externalId: String(user_id),
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const member = await getMember({
      id: profile.memberId,
    });

    if (!member) return NextResponse.json({ status: 200 });

    const tags = await listTags({ workspaceId });
    const currentTag = tags.find((tag) => tag.externalId === String(badge_id));
    const userTags = member.tags.filter((tag) => tag !== currentTag?.id);

    await updateMember({
      ...member,
      tags: userTags,
    });
  }

  if (
    solved &&
    (event === "accepted_solution" || event === "unaccepted_solution")
  ) {
    const { id, username, category_id } = solved;

    const profile = await getProfile({
      username,
      workspaceId,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const channel = await getChannel({
      externalId: String(category_id),
      workspaceId,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    const activity = await getActivity({
      externalId: `p/${id}`,
      workspaceId,
    });

    if (!activity) return NextResponse.json({ status: 200 });

    const result = await getActivityTypeByKey({
      key:
        event === "accepted_solution" ? "discourse:solved" : "discourse:reply",
      workspaceId,
    });

    if (!result) return NextResponse.json({ status: 200 });

    const { activityType, ...data } = activity;

    await updateActivity({
      ...data,
      activityTypeId: activityType.id,
    });
  }

  return NextResponse.json({ status: 200 });
}

const checkSignature = async (request: NextRequest, rawBody: string) => {
  const signature = request.headers.get("x-discourse-event-signature");
  const communityUrl = request.headers.get("x-discourse-instance");

  if (!signature) return false;

  const secret = env.DISCOURSE_SECRET_KEY;

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== `sha256=${expectedSignature}`) {
    return false;
  }

  if (!communityUrl) return false;

  const integration = await prisma.integration.findFirst({
    where: {
      status: "CONNECTED",
      details: {
        path: ["source"],
        equals: "Discourse",
      },
      AND: [
        {
          details: {
            path: ["communityUrl"],
            equals: communityUrl,
          },
        },
      ],
    },
  });

  if (!integration) return false;

  return DiscourseIntegrationSchema.parse(integration);
};
