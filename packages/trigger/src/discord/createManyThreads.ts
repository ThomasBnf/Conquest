import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { discordClient } from "@conquest/db/discord";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import {
  type APIMessage,
  type APIThreadChannel,
  type APIThreadList,
  Routes,
} from "discord-api-types/v10";
import { createMember } from "./createMember";

type Props = {
  discord: DiscordIntegration;
};

export const createManyThreads = async ({ discord }: Props) => {
  const { external_id, workspace_id } = discord;

  if (!external_id) return;

  const responseThreads = (await discordClient.get(
    `${Routes.guildActiveThreads(external_id)}`,
  )) as APIThreadList;

  const threads = responseThreads.threads as APIThreadChannel[];

  logger.info("threads", { threads });

  for (const thread of threads) {
    const { name, parent_id, owner_id: discord_id, thread_metadata } = thread;
    const { create_timestamp } = thread_metadata ?? {};

    if (!discord_id || !parent_id) continue;

    let before: string | undefined = undefined;
    let firstMessage: APIMessage | undefined;

    const channel = await getChannel({
      external_id: parent_id,
      workspace_id,
    });

    if (!channel) continue;

    while (true) {
      const params = new URLSearchParams({
        limit: "100",
        ...(before ? { before: new Date(before).toISOString() } : {}),
      });

      const messages = (await discordClient.get(
        `${Routes.channelMessages(thread.id)}?${params.toString()}`,
      )) as APIMessage[];

      logger.info("messages", { messages });

      if (messages.length < 100) firstMessage = messages.at(-1);

      for (const message of messages) {
        const {
          type,
          content,
          referenced_message,
          timestamp,
          sticker_items,
          author,
        } = message;
        const { content: message_content } = referenced_message ?? {};

        if (author.bot) continue;
        if (sticker_items && sticker_items.length > 0) continue;

        if (message.id === firstMessage?.id) {
          const member_id =
            (await getProfile({ external_id: discord_id, workspace_id }))
              ?.member_id ?? (await createMember({ discord, discord_id }))?.id;

          if (!member_id) continue;

          await createActivity({
            external_id: thread.id,
            activity_type_key: "discord:thread",
            title: name,
            message: type === 21 ? (message_content ?? "") : content,
            member_id,
            channel_id: channel.id,
            created_at: new Date(create_timestamp ?? ""),
            updated_at: new Date(create_timestamp ?? ""),
            source: "Discord",
            workspace_id,
          });

          break;
        }

        const member_id =
          (await getProfile({ external_id: discord_id, workspace_id }))
            ?.member_id ?? (await createMember({ discord, discord_id }))?.id;

        if (!member_id) continue;

        await createActivity({
          external_id: message.id,
          activity_type_key: "discord:reply_thread",
          message: content,
          reply_to: thread.id,
          member_id,
          channel_id: channel.id,
          created_at: new Date(timestamp),
          updated_at: new Date(timestamp),
          source: "Discord",
          workspace_id,
        });
      }

      before = messages.at(-1)?.id;
      if (messages.length < 100) break;
    }
  }
};
