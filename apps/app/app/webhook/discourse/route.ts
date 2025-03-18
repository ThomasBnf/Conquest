import { sleep } from "@/helpers/sleep";
import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { deleteActivity } from "@conquest/clickhouse/activities/deleteActivity";
import { getActivity } from "@conquest/clickhouse/activities/getActivity";
import { updateActivity } from "@conquest/clickhouse/activities/updateActivity";
import { upsertActivity } from "@conquest/clickhouse/activities/upsertActivity";
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
import { deleteProfile } from "@conquest/clickhouse/profiles/deleteProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { updateProfile } from "@conquest/clickhouse/profiles/updateProfile";
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
  const { workspace_id } = integration;

  if (topic && (event === "topic_created" || event === "topic_recovered")) {
    const { id, created_by, category_id, title } = topic;
    const { id: user_id, username } = created_by;

    if (user_id < 0) return NextResponse.json({ status: 200 });

    const profile = await getProfile({
      username,
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    await upsertActivity({
      external_id: `t/${id}`,
      activity_type_key: "discourse:topic",
      title,
      message: "",
      member_id: profile.member_id,
      channel_id: channel.id,
      source: "Discourse",
      workspace_id,
    });
  }

  if (topic && event === "topic_edited") {
    await sleep(1000);
    const { id, title } = topic;

    const activity = await getActivity({
      external_id: `t/${id}`,
      workspace_id,
    });

    if (!activity) return NextResponse.json({ status: 200 });

    const { activity_type, ...data } = activity;

    await updateActivity({
      ...data,
      activity_type_id: activity_type.id,
      title,
    });
  }

  if (topic && event === "topic_destroyed") {
    await sleep(1000);
    const { id } = topic;

    await deleteActivity({
      external_id: `t/${id}`,
      workspace_id,
    });

    await client.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE react_to LIKE 't/${id}'
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
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    if (post_number === 1) {
      const activity = await getActivity({
        external_id: `t/${topic_id}`,
        workspace_id,
      });

      if (!activity) return NextResponse.json({ status: 200 });

      const activityType = await getActivityTypeByKey({
        key: "discourse:topic",
        workspace_id,
      });

      if (!activityType) return NextResponse.json({ status: 200 });

      const { activity_type, ...data } = activity;

      await updateActivity({
        ...data,
        activity_type_id: activityType.id,
        message: post.cooked,
      });

      return NextResponse.json({ status: 200 });
    }

    if (reply_to_user && reply_to_post_number) {
      await createActivity({
        external_id: `p/${id}`,
        activity_type_key: "discourse:reply",
        message: post.cooked,
        reply_to: `t/${topic_id}/${reply_to_post_number}`,
        member_id: profile.member_id,
        channel_id: channel.id,
        source: "Discourse",
        workspace_id,
      });

      return NextResponse.json({ status: 200 });
    }

    await createActivity({
      external_id: `p/${id}`,
      activity_type_key: "discourse:reply",
      reply_to: `t/${topic_id}`,
      message: post.cooked,
      member_id: profile.member_id,
      channel_id: channel.id,
      source: "Discourse",
      workspace_id,
    });
  }

  if (post && event === "post_edited") {
    await sleep(1000);
    const { id, topic_id, post_number } = post;

    const activity = await getActivity({
      external_id: post_number === 1 ? `t/${topic_id}` : `p/${id}`,
      workspace_id,
    });

    if (!activity) return NextResponse.json({ status: 200 });

    const activityType = await getActivityTypeByKey({
      key: post_number === 1 ? "discourse:topic" : "discourse:reply",
      workspace_id,
    });

    if (!activityType) return NextResponse.json({ status: 200 });

    const { activity_type, ...data } = activity;

    await updateActivity({
      ...data,
      activity_type_id: activityType.id,
      message: post.cooked,
    });
  }

  if (post && event === "post_destroyed") {
    await sleep(1000);
    const { id, username } = post;

    const profile = await getProfile({
      username,
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    await deleteActivity({
      external_id: `p/${id}`,
      workspace_id,
    });
  }

  if (like && event === "post_liked") {
    const { post, user } = like;
    const { category_id, topic_id, post_number, reactions } = post;
    const { username } = user;

    const profile = await getProfile({
      username,
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    await createActivity({
      activity_type_key: "discourse:reaction",
      message: reactions?.[0]?.id ?? "like",
      react_to: `t/${topic_id}/${post_number}`,
      member_id: profile.member_id,
      channel_id: channel.id,
      source: "Discourse",
      workspace_id,
    });
  }

  if (user && event === "user_confirmed_email") {
    const { id, name, username, email, avatar_template, invited_by } = user;

    const [first_name, last_name] = name.split(" ");
    const avatar_url = avatar_template.replace("{size}", "500");

    const member = await createMember({
      first_name,
      last_name,
      primary_email: email,
      avatar_url,
      created_at: new Date(),
      source: "Discourse",
      workspace_id,
    });

    await createProfile({
      external_id: String(id),
      member_id: member.id,
      attributes: {
        source: "Discourse",
        username,
      },
      workspace_id,
    });

    const inviter = await getProfile({
      username: String(invited_by.username),
      workspace_id,
    });

    if (!inviter) return NextResponse.json({ status: 200 });

    await createActivity({
      activity_type_key: "discourse:invite",
      message: "invitation accepted",
      invite_to: member.id,
      member_id: inviter.member_id,
      source: "Discourse",
      workspace_id,
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

    const [first_name, last_name] = name.split(" ");
    const avatar_url = avatar_template.replace("{size}", "500");

    const profile = await getProfile({
      username,
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const member = await getMember({
      id: profile.member_id,
    });

    if (!member) return NextResponse.json({ status: 200 });

    await updateMember({
      ...member,
      first_name: first_name ?? "",
      last_name: last_name ?? "",
      primary_email: email,
      secondary_emails,
      avatar_url,
      job_title: title ?? "",
      created_at: new Date(),
      source: "Discourse",
      workspace_id,
    });

    await updateProfile({
      id: profile.id,
      external_id: String(id),
      member_id: member.id,
      attributes: {
        username,
        source: "Discourse",
      },
      workspace_id,
    });
  }

  if (user && event === "user_destroyed") {
    const { username } = user;

    const profile = await getProfile({
      username,
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    await deleteProfile({
      username,
      workspace_id,
    });

    await deleteMember({
      id: profile.member_id,
    });

    await client.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE invite_to = '${profile.member_id}'
        AND workspace_id = '${workspace_id}'
      `,
    });
  }

  if (user && event === "user_logged_in") {
    const { username } = user;
    const profile = await getProfile({
      username,
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    await createActivity({
      activity_type_key: "discourse:login",
      message: "login",
      member_id: profile.member_id,
      source: "Discourse",
      workspace_id,
    });
  }

  if (category && event === "category_created") {
    const { id, name, parent_category_id } = category;

    let channel_name = name;

    if (parent_category_id) {
      const parent = await getChannel({
        external_id: String(parent_category_id),
        workspace_id,
      });

      channel_name = `${parent?.name} - ${name}`;
    }

    await createChannel({
      external_id: String(id),
      name: channel_name,
      source: "Discourse",
      workspace_id,
    });
  }

  if (category && event === "category_updated") {
    const { id, name, parent_category_id } = category;

    let channel_name = name;

    const channel = await getChannel({
      external_id: String(id),
      workspace_id,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    if (parent_category_id) {
      const parent = await getChannel({
        external_id: String(parent_category_id),
        workspace_id,
      });

      channel_name = `${parent?.name} - ${name}`;
    }

    await updateChannel({
      external_id: String(id),
      name: channel_name,
      workspace_id,
    });
  }

  if (category && event === "category_destroyed") {
    const { id } = category;

    const channel = await getChannel({
      external_id: String(id),
      workspace_id,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    await client.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE channel_id = '${channel.id}'
        AND workspace_id = '${workspace_id}'
      `,
    });

    await deleteChannel({
      external_id: String(id),
      workspace_id,
    });
  }

  if (user_badge && event === "user_badge_granted") {
    const { badge_id, user_id } = user_badge;

    const profile = await getProfile({
      external_id: String(user_id),
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const member = await getMember({
      id: profile.member_id,
    });

    if (!member) return NextResponse.json({ status: 200 });

    const tags = await listTags({ workspace_id });
    const existingTag = tags.find(
      (tag) => tag.external_id === String(badge_id),
    );

    if (existingTag) {
      await updateMember({
        ...member,
        tags: [...(member.tags ?? []), existingTag.id],
      });

      return NextResponse.json({ status: 200 });
    }

    const { community_url, api_key, api_key_iv } = integration.details;

    const decryptedApiKey = await decrypt({
      access_token: api_key,
      iv: api_key_iv,
    });

    const client = discourseClient({ community_url, api_key: decryptedApiKey });

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

    const newTag = await createTag({
      external_id: String(badgeId),
      name,
      color,
      source: "Discourse",
      workspace_id,
    });

    await updateMember({
      ...member,
      tags: [...(member?.tags ?? []), newTag.id],
    });
  }

  if (user_badge && event === "user_badge_revoked") {
    const { badge_id, user_id } = user_badge;

    const profile = await getProfile({
      external_id: String(user_id),
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const member = await getMember({
      id: profile.member_id,
    });

    if (!member) return NextResponse.json({ status: 200 });

    const tags = await listTags({ workspace_id });
    const currentTag = tags.find((tag) => tag.external_id === String(badge_id));
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
      workspace_id,
    });

    if (!profile) return NextResponse.json({ status: 200 });

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return NextResponse.json({ status: 200 });

    const activity = await getActivity({
      external_id: `p/${id}`,
      workspace_id,
    });

    if (!activity) return NextResponse.json({ status: 200 });

    const activityType = await getActivityTypeByKey({
      key:
        event === "accepted_solution" ? "discourse:solved" : "discourse:reply",
      workspace_id,
    });

    if (!activityType) return NextResponse.json({ status: 200 });

    const { activity_type, ...data } = activity;

    await updateActivity({
      ...data,
      activity_type_id: activityType.id,
    });
  }

  return NextResponse.json({ status: 200 });
}

const checkSignature = async (request: NextRequest, rawBody: string) => {
  const signature = request.headers.get("x-discourse-event-signature");
  const community_url = request.headers.get("x-discourse-instance");

  if (!signature) return false;

  const secret = env.DISCOURSE_SECRET_KEY;

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== `sha256=${expectedSignature}`) {
    return false;
  }

  if (!community_url) return false;

  const integration = await prisma.integration.findFirst({
    where: {
      details: {
        path: ["source"],
        equals: "Discourse",
      },
      AND: [
        {
          details: {
            path: ["community_url"],
            equals: community_url,
          },
        },
      ],
    },
  });

  return DiscourseIntegrationSchema.parse(integration);
};
