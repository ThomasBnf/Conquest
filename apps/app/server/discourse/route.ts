import { sleep } from "@/helpers/sleep";
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
import { listTags } from "@/queries/tags/listTags";
import type { DiscourseWebhook } from "@conquest/zod/schemas/types/discourse";
import { Hono } from "hono";

export const discourse = new Hono().post("/", async (c) => {
  const integration = await checkSignature({ c });
  if (!integration) return c.json({ error: "Unauthorized" }, 401);

  const event = c.req.header("X-Discourse-Event");
  console.log(event);

  const body = await c.req.json();
  const { category, topic, post, user, like, user_badge } =
    body as DiscourseWebhook;
  const { workspace_id } = integration;

  const post_type = await getActivityType({
    workspace_id,
    key: "discourse:post",
  });

  const reaction_type = await getActivityType({
    workspace_id,
    key: "discourse:reaction",
  });

  const reply_type = await getActivityType({
    workspace_id,
    key: "discourse:reply",
  });

  const invite_type = await getActivityType({
    workspace_id,
    key: "discourse:invite",
  });

  const login_type = await getActivityType({
    workspace_id,
    key: "discourse:login",
  });

  if (topic && (event === "topic_created" || event === "topic_recovered")) {
    const { id, created_by, category_id, title } = topic;
    const { id: user_id, username } = created_by;

    if (user_id < 0) return c.json({ status: 200 });

    const member = await getMember({
      username,
      workspace_id,
    });

    if (!member) return c.json({ status: 404 });

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return c.json({ status: 404 });

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
      activity_type_id: post_type.id,
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
        external_id: String(topic_id),
        message: post.cooked,
        activity_type_id: post_type.id,
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

      if (!member) return c.json({ status: 404 });

      const activities = await prisma.activities.findMany({
        where: {
          thread_id: String(topic_id),
        },
        orderBy: {
          created_at: "asc",
        },
      });

      if (activities.length === 0) return c.json({ status: 404 });

      const replyTo = activities[reply_to_post_number - 1];

      if (!replyTo) return c.json({ status: 404 });

      const channel = await getChannel({
        external_id: String(category_id),
        workspace_id,
      });

      if (!channel) return c.json({ status: 404 });

      await createActivity({
        external_id: String(id),
        activity_type_id: reply_type.id,
        message: post.cooked,
        reply_to: replyTo.id,
        thread_id: String(topic_id),
        member_id: member.id,
        channel_id: channel.id,
        workspace_id,
      });

      return c.json({ status: 200 });
    }

    const member = await getMember({
      username,
      workspace_id,
    });

    if (!member) return c.json({ status: 404 });

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return c.json({ status: 404 });

    const activities = await prisma.activities.findMany({
      where: {
        thread_id: String(topic_id),
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (activities.length === 0) return c.json({ status: 404 });

    await createActivity({
      external_id: String(id),
      message: post.cooked,
      activity_type_id: reply_type.id,
      thread_id: String(topic_id),
      member_id: member.id,
      channel_id: channel.id,
      workspace_id,
    });
  }

  if (post && event === "post_edited") {
    await sleep(1000);
    const { id, post_number, topic_id } = post;

    await updateActivity({
      external_id: String(post_number === 1 ? topic_id : id),
      activity_type_id: post_number === 1 ? post_type.id : reply_type.id,
      message: post.cooked,
      workspace_id,
    });
  }

  if (post && event === "post_destroyed") {
    await sleep(1000);
    const { id } = post;

    await deleteActivity({
      external_id: String(id),
      workspace_id,
    });
  }

  if (like && event === "post_liked") {
    const { post, user } = like;
    const { id, category_id, topic_id, post_number } = post;
    const { username } = user;

    const member = await getMember({
      username,
      workspace_id,
    });

    if (!member) return c.json({ status: 404 });

    const channel = await getChannel({
      external_id: String(category_id),
      workspace_id,
    });

    if (!channel) return c.json({ status: 404 });

    const reactTo = post_number === 1 ? topic_id : id;

    await createActivity({
      external_id: null,
      activity_type_id: reaction_type.id,
      message: "like",
      react_to: String(reactTo),
      thread_id: String(topic_id),
      member_id: member.id,
      channel_id: channel.id,
      workspace_id,
    });
  }

  if (user && event === "user_confirmed_email") {
    const { id, name, username, email, avatar_template, invited_by } = user;

    const [first_name, last_name] = name.split(" ");
    const avatar_url = avatar_template.replace("{size}", "500");

    await upsertMember({
      id: String(id),
      data: {
        username,
        first_name,
        last_name,
        primary_email: email,
        avatar_url,
        joined_at: new Date(),
        source: "DISCOURSE",
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
      activity_type_id: invite_type.id,
      message: `${username} has joined the community through your invitation`,
      member_id: inviter.id,
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
      bio_excerpt,
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
        bio: bio_excerpt,
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

    if (!member) return c.json({ status: 404 });

    await createActivity({
      external_id: null,
      activity_type_id: login_type.id,
      message: `${member.first_name} has logged in`,
      member_id: member.id,
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

  if (user_badge && event === "user_badge_revoked") {
    const { id, user_id } = user_badge;

    const member = await getMember({
      id: String(user_id),
      source: "DISCOURSE",
      workspace_id,
    });

    if (!member) return c.json({ status: 404 });

    const tags = await listTags({ workspace_id });
    const currentTag = tags.find((tag) => tag.external_id === String(id));
    const userTags = member.tags.filter((tag) => tag !== currentTag?.id);

    await prisma.members.update({
      where: { id: member.id },
      data: {
        tags: userTags,
      },
    });
  }

  if (user_badge && event === "user_badge_granted") {
    const { id, user_id } = user_badge;

    const member = await getMember({
      id: String(user_id),
      source: "DISCOURSE",
      workspace_id,
    });

    if (!member) return c.json({ status: 404 });

    const tags = await listTags({ workspace_id });
    const currentTag = tags.find((tag) => tag.external_id === String(id));

    await prisma.members.update({
      where: { id: member.id },
      data: {
        tags: {
          push: currentTag?.id,
        },
      },
    });
  }

  return c.json({ status: 200 });
});
