import { discordClient } from "@/lib/discord";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import {
  type APIMessage,
  type APIMessageReference,
  type APIThreadChannel,
  type APIThreadList,
  Routes,
} from "discord-api-types/v10";
import { createActivity } from "../activities/createActivity";
import { getChannel } from "../channels/getChannel";
import { getMember } from "../members/getMember";

type Props = {
  discord: DiscordIntegration;
};

export const createManyThreads = async ({ discord }: Props) => {
  const { external_id, workspace_id } = discord;

  if (!external_id) return;

  let after: string | undefined = undefined;

  while (true) {
    const responseThreads = (await discordClient.get(
      `${Routes.guildActiveThreads(external_id)}?limit=100${after ? `&after=${after}` : ""}`,
    )) as APIThreadList;

    const threads = responseThreads.threads as APIThreadChannel[];

    for (const thread of threads) {
      const { name, parent_id } = thread;

      let after: string | undefined = undefined;

      while (true) {
        const messages = (await discordClient.get(
          `${Routes.channelMessages(thread.id)}?limit=100${after ? `&after=${after}` : ""}`,
        )) as APIMessage[];

        const firstMessage = messages.at(-1);

        for (const message of messages) {
          const {
            id,
            type,
            content,
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

          if (!parent_id) {
            console.log("parent_id not found", id);
            continue;
          }

          const channel = await getChannel({
            external_id: parent_id,
            workspace_id,
          });

          if (!channel) {
            console.log("channel not found", parent_id);
            continue;
          }

          if (id === firstMessage?.id) {
            let content = message.content;

            if (type === 21) {
              content = message.referenced_message?.content ?? "";
            }

            await createActivity({
              external_id: id,
              activity_type_key: "discord:post",
              title: name,
              message: content,
              thread_id: thread.id,
              member_id: member.id,
              channel_id: channel.id,
              created_at: new Date(timestamp),
              updated_at: new Date(edited_timestamp ?? timestamp),
              workspace_id,
            });

            continue;
          }

          switch (type) {
            case 0: {
              if (sticker_items && sticker_items.length > 0) break;

              await createActivity({
                external_id: id,
                activity_type_key: "discord:reply",
                message: content,
                thread_id: thread.id,
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
                thread_id: thread.id,
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

        after = messages.at(-1)?.id;

        if (messages.length < 100) break;
      }
    }

    after = threads.at(-1)?.id;

    if (threads.length < 100) break;
  }
};
