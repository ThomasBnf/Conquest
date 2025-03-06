import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { type APIMessage, Routes } from "discord-api-types/v10";
import { discordClient } from "../discord";
import { createMember } from "./createMember";

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
    const messages = (await discordClient.get(
      `${Routes.channelMessages(external_id)}?limit=100${before ? `&before=${before}` : ""}`,
    )) as APIMessage[];

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
      const discord_id = author.id;

      if (author.bot) continue;

      const member_id =
        (await getProfile({ external_id: discord_id, workspace_id }))
          ?.member_id ?? (await createMember({ discord, discord_id }))?.id;

      if (!member_id || !content || thread || sticker_items) continue;

      switch (type) {
        case 0: {
          await createActivity({
            external_id: id,
            activity_type_key: "discord:message",
            message: content,
            member_id,
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
            member_id,
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
  }
};
