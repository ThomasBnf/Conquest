import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { discordClient } from "@conquest/db/discord";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import {
  type APIMessage,
  type APIThreadChannel,
  type APIThreadList,
  Routes,
} from "discord-api-types/v10";

type Props = {
  discord: DiscordIntegration;
  channel: Channel;
};

export const createManyArchivedThreads = async ({
  discord,
  channel,
}: Props) => {
  const { workspace_id } = discord;
  const { external_id } = channel;

  if (!external_id) return;

  let before: string | undefined = undefined;

  while (true) {
    const params = new URLSearchParams({
      limit: "100",
      ...(before ? { before: new Date(before).toISOString() } : {}),
    });

    const responseThreads = (await discordClient.get(
      `${Routes.channelThreads(external_id, "public")}?${params.toString()}`,
    )) as APIThreadList;

    logger.info("responseThreads", { responseThreads });

    const threads = responseThreads.threads as APIThreadChannel[];

    for (const thread of threads) {
      const { name, parent_id, owner_id, thread_metadata } = thread;
      const { create_timestamp } = thread_metadata ?? {};

      if (!owner_id || !parent_id) continue;

      let before: string | undefined = undefined;
      let firstMessage: APIMessage | undefined;

      while (true) {
        const params = new URLSearchParams({
          limit: "100",
          ...(before ? { before } : {}),
        });

        const messages = (await discordClient.get(
          `${Routes.channelMessages(thread.id)}?${params.toString()}`,
        )) as APIMessage[];

        logger.info("archived thread messages", { messages });

        if (messages.length < 100) firstMessage = messages.at(-1);

        const channel = await getChannel({
          external_id: parent_id,
          workspace_id,
        });

        if (!channel) continue;

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
          const { id: author_id } = author;
          if (author.bot) continue;
          if (sticker_items && sticker_items.length > 0) continue;

          if (message.id === firstMessage?.id) {
            const profile = await getProfile({
              external_id: owner_id,
              workspace_id,
            });

            if (!profile) continue;

            await createActivity({
              external_id: thread.id,
              activity_type_key: "discord:thread",
              title: name,
              message: type === 21 ? (message_content ?? "") : content,
              member_id: profile.member_id,
              channel_id: channel.id,
              created_at: new Date(create_timestamp ?? ""),
              updated_at: new Date(create_timestamp ?? ""),
              source: "Discord",
              workspace_id,
            });

            break;
          }

          const profile = await getProfile({
            external_id: author_id,
            workspace_id,
          });

          if (!profile) continue;

          await createActivity({
            external_id: message.id,
            activity_type_key: "discord:reply_thread",
            message: content,
            reply_to: thread.id,
            member_id: profile.member_id,
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

    before = threads.at(-1)?.thread_metadata?.create_timestamp;
    if (threads.length < 100) break;
  }
};
