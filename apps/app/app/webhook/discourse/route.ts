import { sleep } from "@/helpers/sleep";
import { discourseClient } from "@conquest/db/discourse";
import { prisma } from "@conquest/db/prisma";
import { createActivity } from "@conquest/db/queries/activity/createActivity";
import { deleteActivity } from "@conquest/db/queries/activity/deleteActivity";
import { updateActivity } from "@conquest/db/queries/activity/updateActivity";
import { upsertActivity } from "@conquest/db/queries/activity/upsertActivity";
import { createChannel } from "@conquest/db/queries/channel/createChannel";
import { deleteChannel } from "@conquest/db/queries/channel/deleteChannel";
import { getChannel } from "@conquest/db/queries/channel/getChannel";
import { updateChannel } from "@conquest/db/queries/channel/updateChannel";
import { checkSignature } from "@conquest/db/queries/discourse/checkSignature";
import { getMember } from "@conquest/db/queries/member/getMember";
import { updateMember } from "@conquest/db/queries/member/updateMember";
import { upsertMember } from "@conquest/db/queries/member/upsertMember";
import { deleteProfile } from "@conquest/db/queries/profile/deleteProfile";
import { getProfile } from "@conquest/db/queries/profile/getProfile";
import { upsertProfile } from "@conquest/db/queries/profile/upsertProfile";
import { createTag } from "@conquest/db/queries/tag/createTag";
import { listTags } from "@conquest/db/queries/tag/listTags";
import type { DiscourseWebhook } from "@conquest/zod/types/discourse";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const integration = await checkSignature({ request });

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
      external_id: `t-${id}`,
      activity_type_key: "discourse:topic",
      title,
      message: "",
      member_id: profile.member_id,
      channel_id: channel.id,
      source: "DISCOURSE",
      workspace_id,
    });
  }

  if (topic && event === "topic_edited") {
    await sleep(1000);
    const { id, title } = topic;

    await updateActivity({
      external_id: `t-${id}`,
      activity_type_key: "discourse:topic",
      title,
      workspace_id,
    });
  }

  if (topic && event === "topic_destroyed") {
    await sleep(1000);
    const { id } = topic;

    await deleteActivity({
      external_id: `t-${id}`,
      workspace_id,
    });

    await prisma.activity.deleteMany({
      where: {
        OR: [
          {
            react_to: {
              contains: `t-${id}`,
            },
          },
          {
            reply_to: {
              contains: `t-${id}`,
            },
          },
        ],
      },
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
      await updateActivity({
        external_id: `t-${topic_id}`,
        message: post.cooked,
        activity_type_key: "discourse:topic",
        workspace_id,
      });

      return NextResponse.json({ status: 200 });
    }

    if (reply_to_user && reply_to_post_number) {
      await createActivity({
        external_id: `p-${id}`,
        activity_type_key: "discourse:reply",
        message: post.cooked,
        reply_to: `t/${topic_id}/${reply_to_post_number}`,
        member_id: profile.member_id,
        channel_id: channel.id,
        source: "DISCOURSE",
        workspace_id,
      });

      return NextResponse.json({ status: 200 });
    }

    await createActivity({
      external_id: `p-${id}`,
      activity_type_key: "discourse:reply",
      reply_to: `t/${topic_id}`,
      message: post.cooked,
      member_id: profile.member_id,
      channel_id: channel.id,
      source: "DISCOURSE",
      workspace_id,
    });
  }

  if (post && event === "post_edited") {
    await sleep(1000);
    const { id, post_number, topic_id } = post;

    await updateActivity({
      external_id: post_number === 1 ? `t-${topic_id}` : `p-${id}`,
      activity_type_key:
        post_number === 1 ? "discourse:topic" : "discourse:reply",
      message: post.cooked,
      workspace_id,
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
      external_id: `p-${id}`,
      workspace_id,
    });
  }

  if (like && event === "post_liked") {
    const { post, user } = like;
    const { id, category_id, topic_id, post_number } = post;
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
      external_id: null,
      activity_type_key: "discourse:reaction",
      message: "like",
      react_to: `t/${topic_id}/${post_number}`,
      member_id: profile.member_id,
      channel_id: channel.id,
      source: "DISCOURSE",
      workspace_id,
    });
  }

  if (user && event === "user_confirmed_email") {
    const { id, name, username, email, avatar_template, invited_by } = user;

    const [first_name, last_name] = name.split(" ");
    const avatar_url = avatar_template.replace("{size}", "500");

    const upsertedMember = await upsertMember({
      id: String(id),
      data: {
        first_name,
        last_name,
        primary_email: email,
        avatar_url,
        created_at: new Date(),
      },
      source: "DISCOURSE",
      workspace_id,
    });

    await upsertProfile({
      external_id: String(id),
      member_id: upsertedMember.id,
      attributes: {
        source: "DISCOURSE",
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
      external_id: String(id),
      activity_type_key: "discourse:invite",
      message: "",
      member_id: inviter.id,
      source: "DISCOURSE",
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

    const upsertedMember = await upsertMember({
      id: String(id),
      data: {
        first_name,
        last_name,
        primary_email: email,
        secondary_emails,
        avatar_url,
        job_title: title,
        created_at: new Date(),
      },
      source: "DISCOURSE",
      workspace_id,
    });

    await upsertProfile({
      external_id: String(id),
      member_id: upsertedMember.id,
      attributes: {
        username,
        source: "DISCOURSE",
      },
      workspace_id,
    });
  }

  if (user && event === "user_destroyed") {
    const { username } = user;

    await deleteProfile({
      username,
      workspace_id,
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
      message: "",
      member_id: profile.member_id,
      source: "DISCOURSE",
      workspace_id,
    });
  }

  if (category && event === "category_created") {
    const { id, name, slug, parent_category_id } = category;

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
      slug,
      source: "DISCOURSE",
      workspace_id,
    });
  }

  if (category && event === "category_updated") {
    const { id, name, slug, parent_category_id } = category;

    let channel_name = name;

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
      slug,
      workspace_id,
    });
  }

  if (category && event === "category_destroyed") {
    const { id } = category;

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

    const tags = await listTags({ workspace_id });
    const existingTag = tags.find(
      (tag) => tag.external_id === String(badge_id),
    );

    if (existingTag) {
      await prisma.member.update({
        where: {
          id: profile.member_id,
        },
        data: {
          tags: {
            push: existingTag.id,
          },
        },
      });

      return NextResponse.json({ status: 200 });
    }

    const { community_url, api_key } = integration.details;
    const client = discourseClient({ community_url, api_key });

    const { badges } = await client.adminListBadges();
    const badge = badges.find((badge) => badge.id === badge_id);

    if (!badge) return NextResponse.json({ status: 200 });

    const { id: badgeId, name, badge_type_id } = badge;

    const newTag = await createTag({
      external_id: String(badgeId),
      name,
      color: String(badge_type_id),
      source: "DISCOURSE",
      workspace_id,
    });

    await prisma.member.update({
      where: {
        id: profile.member_id,
      },
      data: {
        tags: {
          push: newTag.id,
        },
      },
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
      id: profile.member_id,
      data: {
        tags: userTags,
      },
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

    await updateActivity({
      external_id: `p-${id}`,
      activity_type_key:
        event === "accepted_solution" ? "discourse:solved" : "discourse:reply",
      workspace_id,
    });
  }
}
