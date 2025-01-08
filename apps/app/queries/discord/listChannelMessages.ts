import { discordClient } from "@/lib/discord";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import {
  type APIMessage,
  type APIMessageReference,
  Routes,
} from "discord-api-types/v10";
import { createActivity } from "../activities/createActivity";
import { getMember } from "../members/getMember";

type Props = {
  channel_id: string;
  channel: Channel;
  workspace_id: string;
  after?: string;
};

export const listChannelMessages = async ({
  channel_id,
  channel,
  workspace_id,
  after,
}: Props) => {
  const messages = (await discordClient.get(
    `${Routes.channelMessages(channel_id)}?limit=100${after ? `&after=${after}` : ""}`,
  )) as APIMessage[];

  for (const message of messages) {
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

    const member = await getMember({
      discord_id: author.id,
      workspace_id,
    });

    if (!member) {
      console.log("member not found", author.id);
      continue;
    }

    switch (type) {
      case 0: {
        if (thread) break;
        if (sticker_items && sticker_items.length > 0) break;

        await createActivity({
          external_id: id,
          activity_type_key: "discord:post",
          message: content,
          member_id: member.id,
          channel_id: channel.id,
          created_at: new Date(timestamp),
          updated_at: new Date(edited_timestamp ?? timestamp),
          workspace_id,
        });

        break;
      }
      case 19: {
        const { message_id } = message_reference as APIMessageReference;

        if (sticker_items && sticker_items.length > 0) break;

        await createActivity({
          external_id: message.id,
          activity_type_key: "discord:reply",
          message: message.content,
          reply_to: message_id,
          member_id: member.id,
          channel_id: channel.id,
          created_at: new Date(timestamp),
          updated_at: new Date(edited_timestamp ?? timestamp),
          workspace_id,
        });
        break;
      }
    }
  }

  return messages;
};
