import { createActivity } from "@conquest/db/activity/createActivity";
import { getChannel } from "@conquest/db/channel/getChannel";
import { getProfile } from "@conquest/db/profile/getProfile";
import { discordClient } from "@conquest/db/discord";
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
};

export const createManyThreads = async ({ discord }: Props) => {
  const { externalId, workspaceId } = discord;

  if (!externalId) return;

  const responseThreads = (await discordClient.get(
    `${Routes.guildActiveThreads(externalId)}`,
  )) as APIThreadList;

  const threads = responseThreads.threads as APIThreadChannel[];

  logger.info("Active threads", { count: threads.length, threads });

  for (const thread of threads) {
    const { name, parent_id, owner_id, thread_metadata } = thread;
    const { create_timestamp } = thread_metadata ?? {};

    if (!owner_id || !parent_id) continue;

    const channel = await getChannel({
      externalId: parent_id,
      workspaceId,
    });

    if (!channel) continue;

    let before: string | undefined = undefined;
    let firstMessage: APIMessage | undefined;

    while (true) {
      const params = new URLSearchParams({
        limit: "100",
        ...(before ? { before } : {}),
      });

      try {
        const messages = (await discordClient.get(
          `${Routes.channelMessages(thread.id)}?${params.toString()}`,
        )) as APIMessage[];

        logger.info("Active thread messages", { messages });

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
          const { id: author_id } = author;

          if (author.bot) continue;
          if (sticker_items && sticker_items.length > 0) continue;

          if (message.id === firstMessage?.id) {
            const profile = await getProfile({
              externalId: owner_id,
              workspaceId,
            });

            if (!profile) continue;

            await createActivity({
              externalId: thread.id,
              activityTypeKey: "discord:thread",
              title: name,
              message: type === 21 ? (message_content ?? "") : content,
              memberId: profile.memberId,
              channelId: channel.id,
              createdAt: new Date(create_timestamp ?? ""),
              updatedAt: new Date(create_timestamp ?? ""),
              source: "Discord",
              workspaceId,
            });

            break;
          }

          const profile = await getProfile({
            externalId: author_id,
            workspaceId,
          });

          if (!profile) continue;

          await createActivity({
            externalId: message.id,
            activityTypeKey: "discord:reply_thread",
            message: content,
            replyTo: thread.id,
            memberId: profile.memberId,
            channelId: channel.id,
            createdAt: new Date(timestamp),
            updatedAt: new Date(timestamp),
            source: "Discord",
            workspaceId,
          });
        }

        if (messages.length < 100) break;
        before = messages.at(-1)?.id;
      } catch (error) {
        logger.error("Active thread error", { thread, error });
        break;
      }
    }
  }
};
