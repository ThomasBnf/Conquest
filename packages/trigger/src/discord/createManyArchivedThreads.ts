import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { deleteChannel } from "@conquest/clickhouse/channels/deleteChannel";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { discordClient } from "@conquest/db/discord";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { isBefore, parseISO, subYears } from "date-fns";
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
  const { workspaceId } = discord;
  const { id, externalId } = channel;
  const oneYearAgo = subYears(new Date(), 1);

  if (!externalId) return;

  let before: string | undefined = undefined;

  while (true) {
    const params = new URLSearchParams({
      limit: "100",
      ...(before ? { before: new Date(before).toISOString() } : {}),
    });

    try {
      const responseThreads = (await discordClient.get(
        `${Routes.channelThreads(externalId, "public")}?${params.toString()}`,
      )) as APIThreadList;

      logger.info("responseThreads", { responseThreads });

      const threads = responseThreads.threads as APIThreadChannel[];

      const lastThread = threads.at(-1);

      if (lastThread?.thread_metadata?.create_timestamp) {
        const lastThreadDate = parseISO(
          lastThread.thread_metadata.create_timestamp,
        );
        if (isBefore(lastThreadDate, oneYearAgo)) break;
      }

      for (const thread of threads) {
        const { name, parent_id, owner_id, thread_metadata } = thread;
        const { create_timestamp } = thread_metadata ?? {};

        if (create_timestamp) {
          const threadDate = parseISO(create_timestamp);
          if (isBefore(threadDate, oneYearAgo)) break;
        }

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
            externalId: parent_id,
            workspaceId,
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

          before = messages.at(-1)?.id;
          if (messages.length < 100) break;
        }
      }

      before = threads.at(-1)?.thread_metadata?.create_timestamp;
      if (threads.length < 100) break;
    } catch (error) {
      const { name } = error as Error;
      if (name === "DiscordAPIError[50001]") {
        await deleteChannel({ id });

        logger.error("createManyArchivedThreads - Missing access", { channel });

        break;
      }
    }
  }
};
