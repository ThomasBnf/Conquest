import { getActivityTypeByKey } from "@conquest/clickhouse/activity-type/getActivityTypeByKey";
import { createActivity } from "@conquest/clickhouse/activity/createActivity";
import { deleteActivity } from "@conquest/clickhouse/activity/deleteActivity";
import { getActivity } from "@conquest/clickhouse/activity/getActivity";
import { updateActivity } from "@conquest/clickhouse/activity/updateActivity";
import { createChannel } from "@conquest/clickhouse/channel/createChannel";
import { deleteChannel } from "@conquest/clickhouse/channel/deleteChannel";
import { getChannel } from "@conquest/clickhouse/channel/getChannel";
import { updateChannel } from "@conquest/clickhouse/channel/updateChannel";
import { client as clickhouseClient } from "@conquest/clickhouse/client";
import { createMember } from "@conquest/clickhouse/member/createMember";
import { deleteMember } from "@conquest/clickhouse/member/deleteMember";
import { getMember } from "@conquest/clickhouse/member/getMember";
import { updateMember } from "@conquest/clickhouse/member/updateMember";
import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { deleteProfile } from "@conquest/clickhouse/profile/deleteProfile";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { updateProfile } from "@conquest/clickhouse/profile/updateProfile";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { prisma } from "@conquest/db/prisma";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import {
  ActivityType,
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  type NonThreadGuildBasedChannel,
  Partials,
} from "discord.js";
import { config } from "dotenv";
import express from "express";
import { sleep } from "./helpers/sleep";

config();

const app = express();
const port = process.env.DISCORD_PORT || 10000;

app.get("/", (_req, res) => {
  res.send("Discord bot is running!");
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once("ready", () => {
  console.log("Discord bot is ready!");

  client.user?.setPresence({
    status: "online",
    activities: [
      {
        name: "Conquest",
        type: ActivityType.Watching,
      },
    ],
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  console.log("GuildMemberAdd");
  const { user, guild } = member;
  const { id, bot, username, globalName, avatar } = user;

  if (bot) return;

  const integration = await getIntegration({
    externalId: guild.id,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const firstName = globalName?.split(" ")[0] ?? "";
  const lastName = globalName?.split(" ")[1] ?? "";

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
    : "";

  try {
    const existingProfile = await getProfile({
      externalId: id,
      workspaceId,
    });

    console.log("existingProfile", existingProfile);

    if (!existingProfile) {
      const createdMember = await createMember({
        firstName,
        lastName,
        avatarUrl,
        source: "Discord",
        workspaceId,
      });

      await createProfile({
        externalId: id,
        attributes: {
          username,
          source: "Discord",
        },
        memberId: createdMember.id,
        workspaceId,
      });

      // await triggerWorkflows.trigger({
      //   trigger: "member-created",
      //   member: createdMember,
      // });
    }
  } catch (error) {
    console.error("GuildMemberAdd", error);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  console.log("GuildMemberRemove");
  const { user, guild } = member;
  const { id } = user;

  const integration = await getIntegration({
    externalId: guild.id,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  try {
    const profile = await getProfile({
      externalId: id,
      workspaceId,
    });

    if (!profile) return;

    await deleteProfile({
      externalId: id,
      workspaceId,
    });

    await deleteMember({
      id: profile.memberId,
    });
  } catch (error) {
    console.error("GuildMemberRemove", error);
  }
});

client.on(Events.UserUpdate, async (_, user) => {
  const { id, username, globalName, avatar } = user;

  const firstName = globalName?.split(" ")[0] ?? "";
  const lastName = globalName?.split(" ")[1] ?? "";

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
    : "";

  const profile = await getProfile({ externalId: id });

  if (!profile) return;

  const member = await getMember({
    id: profile.memberId,
  });

  if (!member) return;

  try {
    await updateMember({
      ...member,
      firstName,
      lastName,
      avatarUrl,
    });

    await updateProfile({
      id: profile.id,
      attributes: {
        username: username ?? "",
        source: "Discord",
      },
    });
  } catch (error) {
    console.error("UserUpdate", error);
  }
});

client.on(Events.ChannelCreate, async (channel) => {
  const { id, type, guildId, name, permissionOverwrites } = channel;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const everyonePerms = permissionOverwrites.cache.find(
    (perm) => perm.id === guildId,
  );
  const isPrivate = everyonePerms?.deny.has("ViewChannel");

  if (isPrivate) return;

  if (
    [
      ChannelType.GuildText,
      ChannelType.GuildForum,
      ChannelType.GuildAnnouncement,
    ].includes(type)
  ) {
    try {
      await createChannel({
        externalId: id,
        name,
        source: "Discord",
        workspaceId,
      });
    } catch (error) {
      console.error("ChannelCreate", error);
    }
  }
});

client.on(Events.ChannelUpdate, async (_, channel) => {
  const { id, name, guildId } = channel as NonThreadGuildBasedChannel;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  try {
    await updateChannel({
      externalId: id,
      name,
      workspaceId,
    });
  } catch (error) {
    console.error("ChannelUpdate", error);
  }
});

client.on(Events.ChannelDelete, async (channel) => {
  const { id, guildId } = channel as NonThreadGuildBasedChannel;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  try {
    await deleteChannel({
      externalId: id,
      workspaceId,
    });
  } catch (error) {
    console.error("ChannelDelete", error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  const { id, channelId, guildId, type, content, author, reference } = message;
  const { id: externalId } = author;

  if (!guildId || !content) return;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const profile = await getProfile({
    externalId,
    workspaceId,
  });

  if (!profile) return;

  const channel = await getChannel({ externalId: channelId, workspaceId });

  if (type === 4) {
    //CHANNEL NAME CHANGED
    const activityWithType = await getActivity({
      externalId: channelId,
      workspaceId,
    });

    if (!activityWithType) return;

    const { activityType, ...activity } = activityWithType;

    return await updateActivity({
      ...activity,
      title: content,
    });
  }

  if (type === 19 && reference) {
    //REPLY
    const channel = await getChannel({ externalId: channelId, workspaceId });

    if (!channel) {
      const thread = client.channels.cache.get(channelId);
      const isThread = thread?.isThread();

      if (!isThread) return;

      const { parentId } = thread;

      if (!parentId) return;

      const channel = await getChannel({ externalId: parentId, workspaceId });

      return await createActivity({
        externalId: id,
        activityTypeKey: "discord:reply_thread",
        message: content,
        replyTo: thread.id,
        memberId: profile.memberId,
        channelId: channel?.id,
        source: "Discord",
        workspaceId,
      });
    }

    return await createActivity({
      externalId: id,
      activityTypeKey: "discord:reply",
      message: content,
      replyTo: reference.messageId,
      memberId: profile.memberId,
      channelId: channel?.id,
      source: "Discord",
      workspaceId,
    });
  }

  if (!channel) {
    //REPLY IN THREAD

    await sleep(2000);

    const activityWithType = await getActivity({
      externalId: id,
      workspaceId,
    });

    if (!activityWithType) {
      const thread = client.channels.cache.get(channelId);
      const isThread = thread?.isThread();

      if (!isThread) return;

      const { parentId } = thread;

      if (!parentId) return;

      const channel = await getChannel({ externalId: parentId, workspaceId });

      return await createActivity({
        externalId: id,
        activityTypeKey: "discord:reply_thread",
        message: content,
        replyTo: channelId,
        memberId: profile.memberId,
        channelId: channel?.id,
        source: "Discord",
        workspaceId,
      });
    }

    const { activityType, ...activity } = activityWithType;

    return await updateActivity({
      ...activity,
      message: content,
    });
  }

  await createActivity({
    externalId: id,
    activityTypeKey: "discord:message",
    message: content,
    memberId: profile.memberId,
    channelId: channel?.id,
    source: "Discord",
    workspaceId,
  });
});

client.on(Events.MessageUpdate, async (message) => {
  const { id, guildId, reactions } = message;
  const { message: updatedMessage } = reactions;
  const { content } = updatedMessage;

  if (!guildId) return;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const activityWithType = await getActivity({
    externalId: id,
    workspaceId,
  });

  if (!activityWithType) return;

  const { activityType, ...activity } = activityWithType;

  try {
    await updateActivity({
      ...activity,
      message: content,
    });
  } catch (error) {
    console.error("MessageUpdate", error);
  }
});

client.on(Events.MessageDelete, async (message) => {
  const { id, guildId } = message;

  if (!guildId) return;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  try {
    await deleteActivity({
      externalId: id,
      workspaceId,
    });
  } catch (error) {
    console.error("MessageDelete", error);
  }
});

client.on(Events.ThreadCreate, async (thread) => {
  const { id, name, guildId, ownerId, parentId } = thread;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;

  const { workspaceId } = integration;

  const activityWithType = await getActivity({
    externalId: id,
    workspaceId,
  });

  if (activityWithType) {
    const { activityType, ...activity } = activityWithType;

    const newActivityType = await getActivityTypeByKey({
      key: "discord:thread",
      workspaceId,
    });

    if (!newActivityType) return;

    return await updateActivity({
      ...activity,
      title: name,
      activityTypeId: newActivityType?.id,
    });
  }

  const profile = await getProfile({
    externalId: ownerId,
    workspaceId,
  });

  if (!profile || !parentId) return;

  const channel = await getChannel({ externalId: parentId, workspaceId });

  await createActivity({
    externalId: id,
    activityTypeKey: "discord:thread",
    title: name,
    memberId: profile.memberId,
    channelId: channel?.id,
    source: "Discord",
    workspaceId,
  });
});

client.on(Events.ThreadDelete, async (thread) => {
  const { id, guildId } = thread;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  try {
    const result = await clickhouseClient.query({
      query: `
        SELECT * FROM activity
        WHERE replyTo = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
    });

    const { data } = await result.json();
    const activities = ActivitySchema.array().parse(data);

    for (const activity of activities) {
      const { externalId } = activity;

      await clickhouseClient.query({
        query: `
          ALTER TABLE activity
          DELETE WHERE reactTo = '${externalId}'
          OR replyTo = '${externalId}'
          AND workspaceId = '${workspaceId}'
        `,
      });
    }

    await clickhouseClient.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE reactTo = '${id}'
        OR replyTo = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
    });

    await deleteActivity({
      externalId: id,
      workspaceId,
    });
  } catch (error) {
    console.error("ThreadDelete", error);
  }
});

client.on(Events.GuildRoleCreate, async (role) => {
  const { id, name, guild } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  try {
    await prisma.tag.create({
      data: {
        externalId: id,
        name,
        color: "#99AAB5",
        source: "Discord",
        workspaceId,
      },
    });
  } catch (error) {
    console.error("GuildRoleCreate", error);
  }
});

client.on(Events.GuildRoleUpdate, async (_, role) => {
  const { id, name, guild, color } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const hexColor =
    color === 0 ? "#99AAB5" : `#${color.toString(16).padStart(6, "0")}`;

  try {
    await prisma.tag.update({
      where: {
        externalId_workspaceId: {
          externalId: id,
          workspaceId,
        },
      },
      data: {
        name,
        color: hexColor,
      },
    });
  } catch (error) {
    console.error("GuildRoleUpdate", error);
  }
});

client.on(Events.GuildRoleDelete, async (role) => {
  const { id, guild } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  try {
    const tag = await prisma.tag.findFirst({
      where: {
        externalId: id,
        workspaceId,
      },
    });

    if (!tag) return;

    await prisma.tag.delete({
      where: {
        externalId_workspaceId: {
          externalId: id,
          workspaceId,
        },
      },
    });

    await clickhouseClient.query({
      query: `
        ALTER TABLE member
        UPDATE tags = arrayFilter(x -> x != '${tag.id}', tags)
        WHERE workspaceId = '${workspaceId}'
        AND has(tags, '${tag.id}')
      `,
      format: "JSON",
    });
  } catch (error) {
    console.error("GuildRoleDelete", error);
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  const { message, emoji } = reaction;
  const { id, guildId, channelId } = message;
  const { id: externalId } = user;

  if (!guildId) return;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const profile = await getProfile({
    externalId,
    workspaceId,
  });

  if (!profile) return;

  const channel = await getChannel({
    externalId: channelId,
    workspaceId,
  });

  const thread = await getActivity({
    externalId: channelId,
    workspaceId,
  });

  try {
    await createActivity({
      activityTypeKey: "discord:reaction",
      message: emoji.name ?? "",
      reactTo: id,
      memberId: profile.memberId,
      channelId: thread?.channelId ?? channel?.id,
      source: "Discord",
      workspaceId,
    });
  } catch (error) {
    console.error("MessageReactionAdd", error);
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  const { message, emoji } = reaction;
  const { id: messageId, guildId } = message;
  const { id: externalId } = user;

  if (!guildId) return;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const profile = await getProfile({
    externalId,
    workspaceId,
  });
  if (!profile) return;

  try {
    await clickhouseClient.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE reactTo = '${messageId}'
        AND message = '${emoji.name}'
        AND memberId = '${profile.memberId}'
        AND workspaceId = '${workspaceId}'
      `,
    });
  } catch (error) {
    console.error("MessageReactionRemove", error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
