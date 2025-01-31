import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { type APIMessage, Routes } from "discord-api-types/v10";
import { discordClient } from "../../discord";
import { createActivity } from "../activities/createActivity";
import { getMember } from "../members/getMember";
import { createFiles } from "./createFiles";
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
        attachments,
        timestamp,
        sticker_items,
      } = message;
      const { author } = message;
      const discord_id = author.id;

      if (author.bot) continue;

      const member =
        (await getMember({ discord_id, workspace_id })) ??
        (await createMember({ discord, discord_id }));

      if (!member || !content || thread || sticker_items) continue;

      switch (type) {
        case 0: {
          const activity = await createActivity({
            external_id: id,
            activity_type_key: "discord:post",
            message: content,
            member_id: member.id,
            channel_id: channel.id,
            created_at: new Date(timestamp),
            updated_at: new Date(timestamp ?? ""),
            workspace_id,
          });

          await createFiles({
            files: attachments ?? [],
            activity_id: activity?.id,
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
            member_id: member.id,
            channel_id: channel.id,
            created_at: new Date(timestamp),
            updated_at: new Date(timestamp ?? ""),
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
