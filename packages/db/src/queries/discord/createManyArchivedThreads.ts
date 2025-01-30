import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import {
  type APIMessage,
  type APIThreadChannel,
  type APIThreadList,
  Routes,
} from "discord-api-types/v10";
import { discordClient } from "../../discord";
import { createActivity } from "../activities/createActivity";
import { getChannel } from "../channels/getChannel";
import { getMember } from "../members/getMember";
import { createFiles } from "./createFiles";
import { createMember } from "./createMember";

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

    const threads = responseThreads.threads as APIThreadChannel[];

    for (const thread of threads) {
      const { name, parent_id, owner_id: discord_id, thread_metadata } = thread;
      const { create_timestamp } = thread_metadata ?? {};

      if (!discord_id || !parent_id) continue;

      let before: string | undefined = undefined;
      let firstMessage: APIMessage | undefined;

      while (true) {
        const params = new URLSearchParams({
          limit: "100",
          ...(before ? { before: new Date(before).toISOString() } : {}),
        });

        const messages = (await discordClient.get(
          `${Routes.channelMessages(thread.id)}?${params.toString()}`,
        )) as APIMessage[];

        if (messages.length < 100) firstMessage = messages.at(-1);

        const channel = await getChannel({
          external_id: parent_id,
          workspace_id,
        });

        if (!channel) continue;

        for (const message of messages) {
          console.log("archived thread message", message);
          const {
            type,
            content,
            referenced_message,
            attachments,
            timestamp,
            sticker_items,
            author,
          } = message;
          const { content: message_content } = referenced_message ?? {};

          if (sticker_items && sticker_items.length > 0) continue;

          if (message.id === firstMessage?.id) {
            const member =
              (await getMember({ discord_id, workspace_id })) ??
              (await createMember({ discord, discord_id }));

            if (!member) continue;

            const activity = await createActivity({
              external_id: thread.id,
              activity_type_key: "discord:post",
              title: name,
              message: type === 21 ? (message_content ?? "") : content,
              member_id: member.id,
              channel_id: channel.id,
              created_at: new Date(create_timestamp ?? ""),
              updated_at: new Date(create_timestamp ?? ""),
              workspace_id,
            });

            await createFiles({
              files: attachments ?? [],
              activity_id: activity?.id,
            });

            break;
          }

          const member =
            (await getMember({ discord_id: author.id, workspace_id })) ??
            (await createMember({ discord, discord_id: author.id }));

          if (!member) continue;

          const activity = await createActivity({
            external_id: message.id,
            activity_type_key: "discord:reply",
            message: content,
            reply_to: type === 19 ? referenced_message?.id : thread.id,
            thread_id: thread.id,
            member_id: member.id,
            channel_id: channel.id,
            created_at: new Date(timestamp),
            updated_at: new Date(timestamp),
            workspace_id,
          });

          await createFiles({
            files: attachments ?? [],
            activity_id: activity?.id,
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
