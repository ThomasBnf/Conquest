import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  type NonThreadGuildBasedChannel,
} from "discord.js";
import { config } from "dotenv";
import express from "express";
import { prisma } from "./lib/prisma";
import { sleep } from "./lib/sleep";
import { createActivity } from "./queries/activities/createActivity";
import { getActivity } from "./queries/activities/getActivity";
import { getChannel } from "./queries/channels/getChannel";
import { createFiles } from "./queries/files/createFiles";
import { getIntegration } from "./queries/integrations/getIntegration";
import { getMember } from "./queries/members/getMember";
import { upsertMember } from "./queries/members/upsertMember";

const app = express();
const port = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.GuildMemberAdd, async (member) => {
  const { user, guild } = member;
  const { id, bot, username, globalName, avatar } = user;

  if (bot) return;

  const integration = await getIntegration({
    external_id: guild.id,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  const firstName = globalName?.split(" ")[0] ?? null;
  const lastName = globalName?.split(" ")[1] ?? null;

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
    : null;

  const createdMember = await upsertMember({
    id,
    data: {
      first_name: firstName,
      last_name: lastName,
      discord_username: username,
      avatar_url: avatarUrl,
    },
    source: "DISCORD",
    workspace_id,
  });

  await createActivity({
    external_id: id,
    activity_type_key: "discord:join",
    message: "Has joined the community",
    member_id: createdMember.id,
    workspace_id,
  });
});

client.on(Events.GuildMemberRemove, async (member) => {
  const { user, guild } = member;
  const { id } = user;

  const integration = await getIntegration({
    external_id: guild.id,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  await prisma.members.deleteMany({
    where: {
      id,
      workspace_id,
    },
  });
});

client.on(Events.UserUpdate, async (user) => {
  const { id, username, globalName, avatar } = user;

  const firstName = globalName?.split(" ")[0] ?? null;
  const lastName = globalName?.split(" ")[1] ?? null;

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
    : null;

  await prisma.members.update({
    where: {
      id,
    },
    data: {
      first_name: firstName,
      last_name: lastName,
      discord_username: username,
      avatar_url: avatarUrl,
    },
  });
});

client.on(Events.ChannelCreate, async (channel) => {
  const { id, type, guildId, name, permissionOverwrites } = channel;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

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
      await prisma.channels.create({
        data: {
          external_id: id,
          name,
          source: "DISCORD",
          workspace_id,
        },
      });
    } catch (error) {
      console.error("ChannelCreate", error);
    }
  }
});

client.on(Events.ChannelUpdate, async (channel) => {
  const { id, name, guildId } = channel as NonThreadGuildBasedChannel;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await prisma.channels.update({
      where: {
        external_id_workspace_id: {
          external_id: id,
          workspace_id,
        },
      },
      data: { name },
    });
  } catch (error) {
    console.error("ChannelUpdate", error);
  }
});

client.on(Events.ChannelDelete, async (channel) => {
  const { id, guildId } = channel as NonThreadGuildBasedChannel;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await prisma.channels.delete({
      where: {
        external_id_workspace_id: {
          external_id: id,
          workspace_id,
        },
      },
    });
  } catch (error) {
    console.error("ChannelDelete", error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  console.log(message);
  const {
    id,
    channelId,
    guildId,
    type,
    content,
    author,
    reference,
    attachments,
  } = message;
  const { id: discord_id } = author;

  if (!guildId) return;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  const member = await getMember({ discord_id, workspace_id });
  if (!member) return;

  const channel = await getChannel({ external_id: channelId, workspace_id });

  if (!channel) {
    const activity = await getActivity({
      external_id: channelId,
      workspace_id,
    });

    if (activity) {
      try {
        const createdActivity = await createActivity({
          external_id: id,
          activity_type_key: "discord:reply",
          message: content,
          reply_to: type === 19 ? reference?.messageId : activity.external_id,
          thread_id: activity.external_id,
          member_id: member.id,
          channel_id: activity.channel_id,
          workspace_id,
        });

        await createFiles({
          files: attachments,
          activity_id: createdActivity?.id,
        });
      } catch (error) {
        console.error("ReplyToThread", error);
      }
    }

    await sleep(1000);

    return await prisma.activities.update({
      where: {
        external_id_workspace_id: {
          external_id: id,
          workspace_id,
        },
      },
      data: {
        message: content,
      },
    });
  }

  if (type === 0) {
    try {
      const createdActivity = await createActivity({
        external_id: id,
        activity_type_key: "discord:post",
        message: content,
        member_id: member.id,
        channel_id: channel.id,
        workspace_id,
      });

      await createFiles({
        files: attachments,
        activity_id: createdActivity?.id,
      });
    } catch (error) {
      console.error("MessageCreate", error);
    }
  }

  if (type === 19) {
    try {
      const createdActivity = await createActivity({
        external_id: id,
        activity_type_key: "discord:reply",
        message: content,
        reply_to: reference?.messageId,
        member_id: member.id,
        channel_id: channel.id,
        workspace_id,
      });

      await createFiles({
        files: attachments,
        activity_id: createdActivity?.id,
      });
    } catch (error) {
      console.error("MessageCreate", error);
    }
  }
});

client.on(Events.MessageUpdate, async (message) => {
  const { id, guildId, reactions } = message;
  const { message: updatedMessage } = reactions;
  const { content } = updatedMessage;

  if (!guildId) return;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await prisma.activities.update({
      where: {
        external_id_workspace_id: {
          external_id: id,
          workspace_id,
        },
      },
      data: {
        message: content,
      },
    });
  } catch (error) {
    console.error("MessageUpdate", error);
  }
});

client.on(Events.MessageDelete, async (message) => {
  const { id, guildId } = message;

  if (!guildId) return;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await prisma.activities.delete({
      where: {
        external_id_workspace_id: {
          external_id: id,
          workspace_id,
        },
      },
    });
  } catch (error) {
    console.error("MessageDelete", error);
  }
});

client.on(Events.ThreadCreate, async (thread) => {
  const { id, parentId, guildId, name, ownerId } = thread;

  if (!guildId || !parentId) return;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  const member = await getMember({ discord_id: ownerId, workspace_id });
  if (!member) return;

  const channel = await getChannel({ external_id: parentId, workspace_id });
  if (!channel) return;

  try {
    await createActivity({
      external_id: id,
      activity_type_key: "discord:post",
      title: name,
      message: "",
      member_id: member.id,
      channel_id: channel.id,
      workspace_id,
    });
  } catch (error) {
    console.error("ThreadCreate", error);
  }
});

client.on(Events.ThreadDelete, async (thread) => {
  const { id, guildId } = thread;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  await prisma.activities.deleteMany({
    where: {
      OR: [
        {
          external_id: id,
          workspace_id,
        },
        {
          thread_id: id,
          workspace_id,
        },
      ],
    },
  });
});

client.on(Events.MessageReactionAdd, async (reaction) => {
  console.log(reaction);
});

client.on(Events.MessageReactionRemove, async (reaction) => {
  console.log(reaction);
});

client.on(Events.InteractionCreate, async (interaction) => {
  console.log(interaction);
});

client.on(Events.GuildRoleCreate, async (role) => {
  const { id, name, guild } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  await prisma.tags.create({
    data: {
      external_id: id,
      name,
      color: "#99AAB5",
      source: "DISCORD",
      workspace_id,
    },
  });
});

client.on(Events.GuildRoleUpdate, async (_, role) => {
  console.log(role);
  const { id, name, guild, color } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  const hexColor =
    color === 0 ? "#99AAB5" : `#${color.toString(16).padStart(6, "0")}`;

  await prisma.tags.update({
    where: {
      external_id_workspace_id: {
        external_id: id,
        workspace_id,
      },
    },
    data: {
      name,
      color: hexColor,
    },
  });
});

client.on(Events.GuildRoleDelete, async (role) => {
  const { id, guild } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    external_id: guildId,
    status: "CONNECTED",
  });
  if (!integration) return;
  const { workspace_id } = integration;

  try {
    const tag = await prisma.tags.findFirst({
      where: {
        external_id: id,
        workspace_id,
      },
    });

    if (!tag) return;

    await prisma.$transaction([
      prisma.tags.delete({
        where: {
          external_id_workspace_id: {
            external_id: id,
            workspace_id,
          },
        },
      }),

      prisma.$executeRaw`
        UPDATE members 
        SET tags = array_remove(tags, ${tag.id})
        WHERE workspace_id = ${workspace_id}
        AND tags @> ARRAY[${tag.id}]::text[]
      `,
    ]);
  } catch (error) {
    console.error("GuildRoleDelete", error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
