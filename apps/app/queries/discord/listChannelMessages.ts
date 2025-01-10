import { discordClient } from "@/lib/discord";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { DiscordAPIError } from "@discordjs/rest";
import {
  type APIMessage,
  type APIMessageReference,
  Routes,
} from "discord-api-types/v10";
import { createActivity } from "../activities/createActivity";
import { getMember } from "../members/getMember";
import { createMember } from "./createMember";

type Props = {
  discord: DiscordIntegration;
  channel_id: string;
  channel: Channel;
  workspace_id: string;
};

export const listChannelMessages = async ({
  discord,
  channel_id,
  channel,
  workspace_id,
}: Props) => {
  let before: string | undefined;

  while (true) {
    const messages = (await discordClient.get(
      `${Routes.channelMessages(channel_id)}?limit=100${before ? `&before=${before}` : ""}`,
    )) as APIMessage[];

    for (const message of messages) {
      try {
        const {
          id,
          type,
          content,
          thread,
          message_reference,
          timestamp,
          edited_timestamp,
          sticker_items,
        } = message;
        const { author } = message;

        console.log({
          id,
          type,
          content,
        });

        let member: Member | null = null;

        member = await getMember({
          discord_id: author.id,
          workspace_id,
        });

        if (!member) {
          member = await createMember({
            discord,
            member_id: author.id,
          });
        }

        switch (type) {
          case 0: {
            if (content === "") break;
            if (thread) break;
            if (sticker_items && sticker_items.length > 0) break;

            await createActivity({
              external_id: id,
              activity_type_key: "discord:post",
              message: content,
              member_id: member?.id ?? "",
              channel_id: channel.id,
              created_at: new Date(timestamp),
              updated_at: new Date(edited_timestamp ?? timestamp),
              workspace_id,
            });

            break;
          }
          case 19: {
            const { message_id } = message_reference as APIMessageReference;

            if (content === "") break;
            if (sticker_items && sticker_items.length > 0) break;

            await createActivity({
              external_id: message.id,
              activity_type_key: "discord:reply",
              message: message.content,
              reply_to: message_id,
              member_id: member?.id ?? "",
              channel_id: channel.id,
              created_at: new Date(timestamp),
              updated_at: new Date(edited_timestamp ?? timestamp),
              workspace_id,
            });

            break;
          }
        }
      } catch (error) {
        if (error instanceof DiscordAPIError) {
          console.error("Failed to process message:", error.rawError);
        } else {
          console.error("@Failed to process message:", error, message);
        }
      }
    }

    before = messages.at(-1)?.id;

    if (messages.length < 100) break;
  }
};
