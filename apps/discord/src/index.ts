import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { deleteActivity } from "@conquest/clickhouse/activities/deleteActivity";
import { getActivity } from "@conquest/clickhouse/activities/getActivity";
import { updateActivity } from "@conquest/clickhouse/activities/updateActivity";
import { getActivityTypeByKey } from "@conquest/clickhouse/activity-types/getActivityTypeByKey";
import { createChannel } from "@conquest/clickhouse/channels/createChannel";
import { deleteChannel } from "@conquest/clickhouse/channels/deleteChannel";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import { updateChannel } from "@conquest/clickhouse/channels/updateChannel";
import { client as clickhouseClient } from "@conquest/clickhouse/client";
import { createMember } from "@conquest/clickhouse/members/createMember";
import { deleteMember } from "@conquest/clickhouse/members/deleteMember";
import { getMember } from "@conquest/clickhouse/members/getMember";
import { updateMember } from "@conquest/clickhouse/members/updateMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { deleteProfile } from "@conquest/clickhouse/profiles/deleteProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
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
    }
  } catch (error) {
    console.error("GuildMemberAdd", error);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
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

    await createProfile({
      externalId: id,
      attributes: {
        username: username ?? "",
        source: "Discord",
      },
      memberId: profile.memberId,
      workspaceId: profile.workspaceId,
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

  if (!channel) {
    await sleep(2000);

    const activity = await getActivity({
      externalId: channelId,
      workspaceId,
    });

    if (activity && activity.message === "") {
      const result = await getActivityTypeByKey({
        key: "discord:thread",
        workspaceId,
      });

      if (!result) return;

      const { activityType, ...data } = activity;

      try {
        return await updateActivity({
          ...data,
          activityTypeId: activityType.id,
          message: content,
        });
      } catch (error) {
        console.error("ThreadFirstMessage", error);
      }
    }

    try {
      await createActivity({
        externalId: id,
        activityTypeKey: "discord:reply_thread",
        message: content,
        replyTo: channelId,
        memberId: profile.memberId,
        channelId: activity?.channelId,
        source: "Discord",
        workspaceId,
      });
    } catch (error) {
      console.error("ThreadReply", error);
    }
  }

  if (type === 0 && channel) {
    try {
      await createActivity({
        externalId: id,
        activityTypeKey: "discord:message",
        message: content,
        memberId: profile.memberId,
        channelId: channel.id,
        source: "Discord",
        workspaceId,
      });
    } catch (error) {
      console.error("MessageCreate", type, error);
    }
  }

  if (type === 19 && channel) {
    try {
      await createActivity({
        externalId: id,
        activityTypeKey: "discord:reply",
        message: content,
        replyTo: reference?.messageId,
        memberId: profile.memberId,
        channelId: channel.id,
        source: "Discord",
        workspaceId,
      });
    } catch (error) {
      console.error("MessageCreate", type, error);
    }
  }
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
  const { id, guildId, author } = message;
  const { id: externalId } = author ?? {};

  if (!guildId) return;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  if (!externalId) return;

  const profile = await getProfile({
    externalId,
    workspaceId,
  });

  if (!profile) return;

  try {
    await deleteActivity({
      externalId: id,
      workspaceId,
    });

    await clickhouseClient.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE reactTo = '${id}'
        OR replyTo = '${id}'
        AND workspaceId = '${workspaceId}'
      `,
    });
  } catch (error) {
    console.error("MessageDelete", error);
  }
});

client.on(Events.ThreadCreate, async (thread) => {
  const { id, parentId, guildId, name, ownerId } = thread;

  if (!guildId || !parentId) return;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const profile = await getProfile({
    externalId: ownerId,
    workspaceId,
  });
  if (!profile) return;

  const channel = await getChannel({ externalId: parentId, workspaceId });
  if (!channel) return;

  try {
    await createActivity({
      externalId: id,
      activityTypeKey: "discord:thread",
      title: name,
      message: "",
      memberId: profile.memberId,
      channelId: channel.id,
      source: "Discord",
      workspaceId,
    });
  } catch (error) {
    console.error("ThreadCreate", error);
  }
});

client.on(Events.ThreadDelete, async (thread) => {
  const { id, guildId, ownerId } = thread;

  const integration = await getIntegration({
    externalId: guildId,
  });

  if (!integration) return;
  const { workspaceId } = integration;

  const profile = await getProfile({
    externalId: ownerId,
    workspaceId,
  });
  if (!profile) return;

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
      //TO DO: Add thread channel NAME IN Activities
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
