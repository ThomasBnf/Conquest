import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { discordClient } from "@conquest/db/discord";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { isBefore, parseISO, subYears } from "date-fns";
import { type APIMessage, Routes } from "discord-api-types/v10";

type Props = {
  channel: Channel;
  workspaceId: string;
};

export const listChannelMessages = async ({ channel, workspaceId }: Props) => {
  const { externalId } = channel;
  const oneYearAgo = subYears(new Date(), 1);

  if (!externalId) return;

  let before: string | undefined;

  while (true) {
    const params = new URLSearchParams({
      limit: "100",
      ...(before ? { before } : {}),
    });

    try {
      const messages = (await discordClient.get(
        `${Routes.channelMessages(externalId)}?${params.toString()}`,
      )) as APIMessage[];

      logger.info("Channel messages", { messages });

      for (const message of messages) {
        const {
          id,
          type,
          content,
          thread,
          message_reference,
          timestamp,
          sticker_items,
        } = message;
        const { author } = message;

        if (author.bot) continue;

        const profile = await getProfile({
          externalId: author.id,
          workspaceId,
        });

        if (!profile || !content || thread || sticker_items) continue;

        switch (type) {
          case 0: {
            await createActivity({
              externalId: id,
              activityTypeKey: "discord:message",
              message: content,
              memberId: profile.memberId,
              channelId: channel.id,
              createdAt: new Date(timestamp),
              updatedAt: new Date(timestamp ?? ""),
              source: "Discord",
              workspaceId,
            });

            break;
          }
          case 19: {
            const { message_id } = message_reference ?? {};

            await createActivity({
              externalId: message.id,
              activityTypeKey: "discord:reply",
              message: message.content,
              replyTo: message_id,
              memberId: profile.memberId,
              channelId: channel.id,
              createdAt: new Date(timestamp),
              updatedAt: new Date(timestamp ?? ""),
              source: "Discord",
              workspaceId,
            });

            break;
          }
        }
      }

      if (messages.length < 100) break;
      before = messages.at(-1)?.id;

      const lastMessage = messages.at(-1);

      if (lastMessage?.timestamp) {
        const lastMessageDate = parseISO(lastMessage.timestamp);
        if (isBefore(lastMessageDate, oneYearAgo)) break;
      }
    } catch (error) {
      const { name } = error as Error;
      if (name === "DiscordAPIError[50001]") {
        logger.error("listChannelMessages - Missing access", { channel });
        break;
      }
    }
  }
};
