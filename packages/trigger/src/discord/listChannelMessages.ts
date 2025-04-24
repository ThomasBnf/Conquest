import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { discordClient } from "@conquest/db/discord";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { type APIMessage, Routes } from "discord-api-types/v10";

type Props = {
  discord: DiscordIntegration;
  channel: Channel;
  workspace_id: string;
};

export const listChannelMessages = async ({
  discord,
  channel,
  workspace_id,
}: Props) => {
  const { external_id } = channel;

  if (!external_id) return;

  let before: string | undefined;

  while (true) {
    const params = new URLSearchParams({
      limit: "100",
      ...(before ? { before } : {}),
    });

    try {
      const messages = (await discordClient.get(
        `${Routes.channelMessages(external_id)}?${params.toString()}`,
      )) as APIMessage[];

      logger.info("messages", { messages });

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
          external_id: author.id,
          workspace_id,
        });

        if (!profile || !content || thread || sticker_items) continue;

        switch (type) {
          case 0: {
            await createActivity({
              external_id: id,
              activity_type_key: "discord:message",
              message: content,
              member_id: profile.member_id,
              channel_id: channel.id,
              created_at: new Date(timestamp),
              updated_at: new Date(timestamp ?? ""),
              source: "Discord",
              workspace_id,
            });

            break;
          }
          case 19: {
            const { message_id } = message_reference ?? {};

            await createActivity({
              external_id: message.id,
              activity_type_key: "discord:reply",
              message: message.content,
              reply_to: message_id,
              member_id: profile.member_id,
              channel_id: channel.id,
              created_at: new Date(timestamp),
              updated_at: new Date(timestamp ?? ""),
              source: "Discord",
              workspace_id,
            });

            break;
          }
        }
      }

      before = messages.at(-1)?.id;
      if (messages.length < 100) break;
    } catch (error) {
      const { name } = error as Error;
      if (name === "DiscordAPIError[50001]") {
        logger.error("listChannelMessages - Missing access", { channel });
        break;
      }
    }
  }
};
