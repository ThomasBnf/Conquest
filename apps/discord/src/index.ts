import { prisma } from "@conquest/db/prisma";
import { createActivity } from "@conquest/db/queries/activity/createActivity";
import { deleteActivity } from "@conquest/db/queries/activity/deleteActivity";
import { getActivity } from "@conquest/db/queries/activity/getActivity";
import { updateActivity } from "@conquest/db/queries/activity/updateActivity";
import { createChannel } from "@conquest/db/queries/channel/createChannel";
import { deleteChannel } from "@conquest/db/queries/channel/deleteChannel";
import { getChannel } from "@conquest/db/queries/channel/getChannel";
import { updateChannel } from "@conquest/db/queries/channel/updateChannel";
import { getIntegration } from "@conquest/db/queries/integration/getIntegration";
import { createMember } from "@conquest/db/queries/member/createMember";
import { updateMember } from "@conquest/db/queries/member/updateMember";
import { deleteProfile } from "@conquest/db/queries/profile/deleteProfile";
import { getProfile } from "@conquest/db/queries/profile/getProfile";
import { upsertProfile } from "@conquest/db/queries/profile/upsertProfile";
import {
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
const port = process.env.PORT || 10000;

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

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InviteCreate, async (invite) => {
  console.log("InviteCreate", invite);
});

client.on(Events.GuildMemberAdd, async (member) => {
  console.dir(member, { depth: 100 });
  const { user, guild } = member;
  const { id, bot, username, globalName, avatar } = user;

  if (bot) return;

  const integration = await getIntegration({
    external_id: guild.id,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  const firstName = globalName?.split(" ")[0] ?? null;
  const lastName = globalName?.split(" ")[1] ?? null;

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
    : null;

  try {
    const existingProfile = await getProfile({
      external_id: id,
      workspace_id,
    });

    if (!existingProfile) {
      const createdMember = await createMember({
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
        },
        source: "DISCORD",
        workspace_id,
      });

      await upsertProfile({
        external_id: id,
        attributes: {
          username,
          source: "DISCORD",
        },
        member_id: createdMember.id,
        workspace_id,
      });
    }
  } catch (error) {
    console.error("GuildMemberAdd", error);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  console.log("GuildMemberRemove", member);
  const { user, guild } = member;
  const { id } = user;

  const integration = await getIntegration({
    external_id: guild.id,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await deleteProfile({
      external_id: id,
      workspace_id,
    });
  } catch (error) {
    console.error("GuildMemberRemove", error);
  }
});

client.on(Events.UserUpdate, async (user) => {
  console.log("UserUpdate", user);
  const { id, username, globalName, avatar } = user;

  const firstName = globalName?.split(" ")[0] ?? null;
  const lastName = globalName?.split(" ")[1] ?? null;

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
    : null;

  try {
    const updatedMember = await updateMember({
      id,
      data: {
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      },
    });

    await upsertProfile({
      external_id: id,
      attributes: {
        username: username ?? "",
        source: "DISCORD",
      },
      member_id: updatedMember.id,
      workspace_id: updatedMember.workspace_id,
    });
  } catch (error) {
    console.error("UserUpdate", error);
  }
});

client.on(Events.ChannelCreate, async (channel) => {
  console.log("ChannelCreate", channel);
  const { id, type, guildId, name, permissionOverwrites } = channel;

  const integration = await getIntegration({
    external_id: guildId,
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
      await createChannel({
        external_id: id,
        name,
        source: "DISCORD",
        workspace_id,
      });
    } catch (error) {
      console.error("ChannelCreate", error);
    }
  }
});

client.on(Events.ChannelUpdate, async (channel) => {
  console.log("ChannelUpdate", channel);
  const { id, name, guildId } = channel as NonThreadGuildBasedChannel;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await updateChannel({
      external_id: id,
      name,
      workspace_id,
    });
  } catch (error) {
    console.error("ChannelUpdate", error);
  }
});

client.on(Events.ChannelDelete, async (channel) => {
  console.log("ChannelDelete", channel);
  const { id, guildId } = channel as NonThreadGuildBasedChannel;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await deleteChannel({
      external_id: id,
      workspace_id,
    });
  } catch (error) {
    console.error("ChannelDelete", error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  console.dir(message, { depth: 100 });
  const { id, channelId, guildId, type, content, author, reference } = message;
  const { id: discord_id } = author;

  if (!guildId || !content) return;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  const profile = await getProfile({
    external_id: discord_id,
    workspace_id,
  });

  if (!profile) return;

  const channel = await getChannel({ external_id: channelId, workspace_id });

  if (!channel) {
    await sleep(1500);

    const activity = await getActivity({
      external_id: channelId,
      workspace_id,
    });

    if (activity && activity.message === "") {
      try {
        return await updateActivity({
          external_id: activity.external_id ?? "",
          activity_type_key: "discord:thread",
          message: content,
          workspace_id,
        });
      } catch (error) {
        console.error("ThreadFirstMessage", error);
      }
    }

    console.log("activity", activity);

    try {
      await createActivity({
        external_id: id,
        activity_type_key: "discord:reply_thread",
        message: content,
        reply_to: channelId,
        member_id: profile.member_id,
        channel_id: activity?.channel_id,
        source: "DISCORD",
        workspace_id,
      });
    } catch (error) {
      console.error("ThreadReply", error);
    }
  }

  if (type === 0 && channel) {
    try {
      await createActivity({
        external_id: id,
        activity_type_key: "discord:message",
        message: content,
        member_id: profile.member_id,
        channel_id: channel.id,
        source: "DISCORD",
        workspace_id,
      });
    } catch (error) {
      console.error("MessageCreate", type, error);
    }
  }

  if (type === 19 && channel) {
    try {
      await createActivity({
        external_id: id,
        activity_type_key: "discord:reply",
        message: content,
        reply_to: reference?.messageId,
        member_id: profile.member_id,
        channel_id: channel.id,
        source: "DISCORD",
        workspace_id,
      });
    } catch (error) {
      console.error("MessageCreate", type, error);
    }
  }
});

client.on(Events.MessageUpdate, async (message) => {
  console.log("MessageUpdate", message);
  const { id, guildId, reactions } = message;
  const { message: updatedMessage } = reactions;
  const { content } = updatedMessage;

  if (!guildId) return;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await prisma.activity.update({
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
  console.log("MessageDelete", message);
  const { id, guildId, author } = message;
  const { id: discord_id } = author ?? {};

  if (!guildId) return;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  if (!discord_id) return;

  const profile = await getProfile({
    external_id: discord_id,
    workspace_id,
  });

  if (!profile) return;

  try {
    await deleteActivity({
      external_id: id,
      workspace_id,
    });

    await prisma.activity.deleteMany({
      where: {
        OR: [{ react_to: id }, { reply_to: id }],
        workspace_id,
      },
    });
  } catch (error) {
    console.error("MessageDelete", error);
  }
});

client.on(Events.ThreadCreate, async (thread) => {
  console.log("ThreadCreate", thread);
  const { id, parentId, guildId, name, ownerId } = thread;

  if (!guildId || !parentId) return;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  const profile = await getProfile({
    external_id: ownerId,
    workspace_id,
  });
  if (!profile) return;

  const channel = await getChannel({ external_id: parentId, workspace_id });
  if (!channel) return;

  try {
    await createActivity({
      external_id: id,
      activity_type_key: "discord:thread",
      title: name,
      message: "",
      member_id: profile.member_id,
      channel_id: channel.id,
      source: "DISCORD",
      workspace_id,
    });
  } catch (error) {
    console.error("ThreadCreate", error);
  }
});

client.on(Events.ThreadDelete, async (thread) => {
  console.log("ThreadDelete", thread);
  const { id, guildId, ownerId } = thread;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  const profile = await getProfile({
    external_id: ownerId,
    workspace_id,
  });
  if (!profile) return;

  try {
    const activities = await prisma.activity.findMany({
      where: {
        reply_to: id,
        workspace_id,
      },
    });

    for (const activity of activities) {
      await prisma.activity.deleteMany({
        where: {
          OR: [
            { react_to: activity.external_id },
            { reply_to: activity.external_id },
          ],
          workspace_id,
        },
      });
    }

    await prisma.activity.deleteMany({
      where: {
        OR: [
          {
            react_to: id,
            workspace_id,
          },
          {
            reply_to: id,
            workspace_id,
          },
        ],
      },
    });

    await deleteActivity({
      external_id: id,
      workspace_id,
    });
  } catch (error) {
    console.error("ThreadDelete", error);
  }
});

client.on(Events.GuildRoleCreate, async (role) => {
  console.log("GuildRoleCreate", role);
  const { id, name, guild } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  try {
    await prisma.tag.create({
      data: {
        external_id: id,
        name,
        color: "#99AAB5",
        source: "DISCORD",
        workspace_id,
      },
    });
  } catch (error) {
    console.error("GuildRoleCreate", error);
  }
});

client.on(Events.GuildRoleUpdate, async (_, role) => {
  console.log("GuildRoleUpdate", role);
  const { id, name, guild, color } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  const hexColor =
    color === 0 ? "#99AAB5" : `#${color.toString(16).padStart(6, "0")}`;

  try {
    await prisma.tag.update({
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
  } catch (error) {
    console.error("GuildRoleUpdate", error);
  }
});

client.on(Events.GuildRoleDelete, async (role) => {
  console.log("GuildRoleDelete", role);
  const { id, guild } = role;
  const { id: guildId } = guild;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  try {
    const tag = await prisma.tag.findFirst({
      where: {
        external_id: id,
        workspace_id,
      },
    });

    if (!tag) return;

    await prisma.$transaction([
      prisma.tag.delete({
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

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  console.log("MessageReactionAdd", reaction, user);
  const { message, emoji } = reaction;
  const { id, guildId, channelId } = message;
  const { id: discord_id } = user;

  if (!guildId) return;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  const profile = await getProfile({
    external_id: discord_id,
    workspace_id,
  });
  if (!profile) return;

  const channel = await getChannel({
    external_id: channelId,
    workspace_id,
  });

  const thread = await getActivity({
    external_id: channelId,
    workspace_id,
  });

  try {
    await createActivity({
      external_id: null,
      activity_type_key: "discord:reaction",
      message: emoji.name ?? "",
      react_to: id,
      member_id: profile.member_id,
      //TO DO: Add thread channel NAME IN Activities
      channel_id: thread?.channel_id ?? channel?.id,
      source: "DISCORD",
      workspace_id,
    });
  } catch (error) {
    console.error("MessageReactionAdd", error);
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  console.log("MessageReactionRemove", reaction, user);
  const { message, emoji } = reaction;
  const { id: messageId, guildId } = message;
  const { id: discord_id } = user;

  if (!guildId) return;

  const integration = await getIntegration({
    external_id: guildId,
  });

  if (!integration) return;
  const { workspace_id } = integration;

  const profile = await getProfile({
    external_id: discord_id,
    workspace_id,
  });
  if (!profile) return;

  try {
    await prisma.activity.deleteMany({
      where: {
        message: emoji.name ?? "",
        react_to: messageId,
        member_id: profile.member_id,
        workspace_id,
      },
    });
  } catch (error) {
    console.error("MessageReactionRemove", error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
