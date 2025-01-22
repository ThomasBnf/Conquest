import { sleep } from "@/helpers/sleep";
import { discourseClient } from "@/lib/discourse";
import { prisma } from "@/lib/prisma";
import { createActivity } from "@/queries/activities/createActivity";
import { deleteActivity } from "@/queries/activities/deleteActivity";
import { updateActivity } from "@/queries/activities/updateActivity";
import { getActivityType } from "@/queries/activity-type/getActivityType";
import { createChannel } from "@/queries/channels/createChannel";
import { deleteChannel } from "@/queries/channels/deleteChannel";
import { getChannel } from "@/queries/channels/getChannel";
import { updateChannel } from "@/queries/channels/updateChannel";
import { checkSignature } from "@/queries/discourse/checkSignature";
import { getMember } from "@/queries/members/getMember";
import { upsertMember } from "@/queries/members/upsertMember";
import { createTag } from "@/queries/tags/createTag";
import { listTags } from "@/queries/tags/listTags";
import { updateMemberMetrics } from "@/trigger/updateMemberMetrics.trigger";
import type { DiscourseWebhook } from "@conquest/zod/types/discourse";
import { Hono } from "hono";

export const discourse = new Hono().post("/", async (c) => {
  const integration = await checkSignature({ c });

  if (!integration) {
    return c.json({ error: "Unauthorized, no integration found" }, 401);
  }

  const event = c.req.header("X-Discourse-Event");

  const body = await c.req.json();
  const { category, topic, post, user, like, user_badge, solved } =
    body as DiscourseWebhook;
  const { workspace_id } = integration;

  const post_type = await getActivityType({
    workspace_id,
    key: "discourse:topic",
  });

  if (topic && (event === "topic_created" || event === "topic_recovered")) {
    const { id, created_by, category_id, title } = topic;
    const { id: user_id, username } = created_by;

    if (user_id < 0) return c.json({ status: 200 });

    const member = await getMember({
      username,
      workspace_id,
    });

    if (!member) return c.json({ error: "Member not found" }, 404);

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return c.json({ error: "Channel not found" }, 404);

    await prisma.activities.upsert({
      where: {
        external_id_workspace_id: {
          external_id: String(id),
          workspace_id,
        },
      },
      update: {
        title,
      },
      create: {
        external_id: String(id),
        activity_type_id: post_type.id,
        title,
        message: "",
        thread_id: String(id),
        member_id: member.id,
        channel_id: channel.id,
        workspace_id,
      },
    });
  }

  if (topic && event === "topic_edited") {
    await sleep(1000);
    const { id, title } = topic;

    await updateActivity({
      external_id: String(id),
      activity_type_key: "discourse:topic",
      title,
      workspace_id,
    });
  }

  if (topic && event === "topic_destroyed") {
    await sleep(1000);
    const { id } = topic;

    await deleteActivity({
      external_id: String(id),
      workspace_id,
    });

    await prisma.activities.deleteMany({
      where: {
        thread_id: String(id),
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

    if (user_id < 0) return c.json({ status: 200 });

    if (post_number === 1) {
      await updateActivity({
        external_id: `t-${topic_id}`,
        message: post.cooked,
        activity_type_key: "discourse:topic",
        workspace_id,
      });

      return c.json({ status: 200 });
    }

    if (reply_to_user && reply_to_post_number) {
      const { category_id, username } = post;

      const member = await getMember({
        username,
        workspace_id,
      });

      if (!member) return c.json({ error: "Member not found" }, 404);

      const channel = await getChannel({
        external_id: String(category_id),
        workspace_id,
      });

      if (!channel) return c.json({ error: "Channel not found" }, 404);

      await createActivity({
        external_id: `p-${id}`,
        activity_type_key: "discourse:reply",
        message: post.cooked,
        reply_to: `t-${topic_id}`,
        thread_id: `t-${topic_id}`,
        member_id: member.id,
        channel_id: channel.id,
        workspace_id,
      });
      await updateMemberMetrics.trigger({ member });

      return c.json({ status: 200 });
    }

    const member = await getMember({
      username,
      workspace_id,
    });

    if (!member) return c.json({ error: "Member not found" }, 404);

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return c.json({ error: "Channel not found" }, 404);

    await createActivity({
      external_id: `p-${id}`,
      activity_type_key: "discourse:reply",
      message: post.cooked,
      thread_id: `t-${topic_id}`,
      member_id: member.id,
      channel_id: channel.id,
      workspace_id,
    });
    await updateMemberMetrics.trigger({ member });
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

    const member = await getMember({
      username,
      workspace_id,
    });

    if (!member) return c.json({ error: "Member not found" }, 404);

    await deleteActivity({
      external_id: `p-${id}`,
      workspace_id,
    });

    await updateMemberMetrics.trigger({ member });
  }

  if (like && event === "post_liked") {
    const { post, user } = like;
    const { id, category_id, topic_id, post_number } = post;
    const { username } = user;

    const member = await getMember({
      username,
      workspace_id,
    });

    if (!member) return c.json({ error: "Member not found" }, 404);

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return c.json({ error: "Channel not found" }, 404);

    const reactTo = post_number === 1 ? `t-${topic_id}` : `p-${id}`;

    await createActivity({
      external_id: null,
      activity_type_key: "discourse:reaction",
      message: "like",
      react_to: reactTo,
      thread_id: `t-${topic_id}`,
      member_id: member.id,
      channel_id: channel.id,
      workspace_id,
    });
    await updateMemberMetrics.trigger({ member });
  }

  if (user && event === "user_confirmed_email") {
    const { id, name, username, email, avatar_template, invited_by } = user;

    const [first_name, last_name] = name.split(" ");
    const avatar_url = avatar_template.replace("{size}", "500");

    const createdMember = await upsertMember({
      id: String(id),
      data: {
        username,
        first_name,
        last_name,
        primary_email: email,
        avatar_url,
        source: "DISCOURSE",
        created_at: new Date(),
        workspace_id,
      },
    });

    const inviter = await getMember({
      username: String(invited_by.username),
      workspace_id,
    });

    if (!inviter) return c.json({ status: 404 });

    await createActivity({
      external_id: String(id),
      activity_type_key: "discourse:invite",
      message: `${username} has joined the community through your invitation`,
      member_id: inviter.id,
      workspace_id,
    });

    await createActivity({
      external_id: null,
      activity_type_key: "discourse:join",
      message: `${username} has joined the community`,
      member_id: createdMember.id,
      workspace_id,
    });

    await updateMemberMetrics.trigger({ member: inviter });
    await updateMemberMetrics.trigger({ member: createdMember });
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

    await upsertMember({
      id: String(id),
      data: {
        username,
        first_name,
        last_name,
        primary_email: email,
        secondary_emails,
        avatar_url,
        job_title: title,
        source: "DISCOURSE",
        workspace_id,
      },
    });
  }

  if (user && event === "user_destroyed") {
    const { username } = user;

    await prisma.members.delete({
      where: {
        username_workspace_id: {
          username,
          workspace_id,
        },
      },
    });
  }

  if (user && event === "user_logged_in") {
    const { username } = user;
    const member = await getMember({
      username,
      workspace_id,
    });

    if (!member) return c.json({ error: "Member not found" }, 404);

    await createActivity({
      external_id: null,
      activity_type_key: "discourse:login",
      message: `${member.first_name} has logged in`,
      member_id: member.id,
      workspace_id,
    });

    await updateMemberMetrics.trigger({ member });
  }

  if (category && event === "category_created") {
    const { id, name, slug, parent_category_id } = category;

    let channel_name = name;

    if (parent_category_id) {
      const parent = await getChannel({
        external_id: String(parent_category_id),
        workspace_id,
      });

      channel_name = `${parent.name} - ${name}`;
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

      channel_name = `${parent.name} - ${name}`;
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

    const member = await getMember({
      discourse_id: String(user_id),
      workspace_id,
    });

    if (!member) return c.json({ error: "Member not found" }, 404);

    const tags = await listTags({ workspace_id });
    const existingTag = tags.find(
      (tag) => tag.external_id === String(badge_id),
    );

    if (existingTag) {
      await prisma.members.update({
        where: { id: member.id },
        data: {
          tags: {
            push: existingTag.id,
          },
        },
      });

      return c.json({ status: 200 });
    }

    const { community_url, api_key } = integration.details;
    const client = discourseClient({ community_url, api_key });

    const { badges } = await client.adminListBadges();
    const badge = badges.find((badge) => badge.id === badge_id);

    if (!badge) return c.json({ error: "Badge not found" }, 404);

    const { id: badgeId, name, badge_type_id } = badge;

    const newTag = await createTag({
      external_id: String(badgeId),
      name,
      color: String(badge_type_id),
      source: "DISCOURSE",
      workspace_id,
    });

    await prisma.members.update({
      where: { id: member.id },
      data: {
        tags: {
          push: newTag.id,
        },
      },
    });
  }

  if (user_badge && event === "user_badge_revoked") {
    const { badge_id, user_id } = user_badge;

    const member = await getMember({
      discourse_id: String(user_id),
      workspace_id,
    });

    if (!member) return c.json({ error: "Member not found" }, 404);

    const tags = await listTags({ workspace_id });
    const currentTag = tags.find((tag) => tag.external_id === String(badge_id));
    const userTags = member.tags.filter((tag) => tag !== currentTag?.id);

    await prisma.members.update({
      where: { id: member.id },
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

    const member = await getMember({ username, workspace_id });

    if (!member) return c.json({ error: "Member not found" }, 404);

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return c.json({ error: "Channel not found" }, 404);

    await updateActivity({
      external_id: `p-${id}`,
      activity_type_key:
        event === "accepted_solution" ? "discourse:solved" : "discourse:reply",
      workspace_id,
    });
  }

  return c.json({ status: 200 });
});
