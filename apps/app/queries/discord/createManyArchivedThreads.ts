import { discordClient } from "@/lib/discord";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { DiscordAPIError } from "@discordjs/rest";
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

  try {
    while (true) {
      const responseThreads = (await discordClient.get(
        `${Routes.channelThreads(external_id, "public")}?limit=100${before ? `&before=${before}` : ""}`,
      )) as APIThreadList;

      const threads = responseThreads.threads as APIThreadChannel[];

      for (const thread of threads) {
        try {
          const { name, parent_id } = thread;

          let messageBefore: string | undefined = undefined;
          let firstMessage: APIMessage | undefined;

          try {
            while (true) {
              const messages = (await discordClient.get(
                `${Routes.channelMessages(thread.id)}?limit=100${messageBefore ? `&before=${messageBefore}` : ""}`,
              )) as APIMessage[];

              if (messages.length < 100) {
                firstMessage = messages.at(-1);
              }

              for (const message of messages) {
                try {
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

                  if (!parent_id) {
                    console.error("parent_id not found", id);
                    continue;
                  }

                  const channel = await getChannel({
                    external_id: parent_id,
                    workspace_id,
                  });

                  if (!channel) {
                    console.error("channel not found", parent_id);
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
                      member_id: member?.id ?? "",
                      channel_id: channel.id,
                      created_at: new Date(timestamp),
                      updated_at: new Date(edited_timestamp ?? timestamp),
                      workspace_id,
                    });

                    continue;
                  }

                  switch (type) {
                    case 0: {
                      if (content === "") break;
                      if (sticker_items && sticker_items.length > 0) break;

                      await createActivity({
                        external_id: id,
                        activity_type_key: "discord:reply",
                        message: content,
                        thread_id: thread.id,
                        member_id: member?.id ?? "",
                        channel_id: channel.id,
                        created_at: new Date(timestamp),
                        updated_at: new Date(edited_timestamp ?? timestamp),
                        workspace_id,
                      });

                      break;
                    }
                    case 19: {
                      if (content === "") break;
                      if (sticker_items && sticker_items.length > 0) break;

                      const { message_id } =
                        message_reference as APIMessageReference;

                      await createActivity({
                        external_id: message.id,
                        activity_type_key: "discord:reply",
                        message: message.content,
                        reply_to: message_id,
                        thread_id: thread.id,
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
                    console.error("Error processing message:", error.rawError);
                  } else {
                    console.error("@Error processing message:", error, message);
                  }
                }
              }

              messageBefore = messages.at(-1)?.id;

              if (messages.length < 100) break;
            }
          } catch (error) {
            if (error instanceof DiscordAPIError) {
              console.error("Error fetching messages:", error.rawError);
            } else {
              console.error("@Error fetching messages:", error);
            }
          }
        } catch (error) {
          if (error instanceof DiscordAPIError) {
            console.error("Error processing thread:", error.rawError);
          } else {
            console.error("@Error processing thread:", error);
          }
        }
      }

      before = threads.at(-1)?.id;

      if (threads.length < 100) break;
    }
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      console.error("Error fetching threads:", error.rawError);
    } else {
      console.error("@Error fetching threads:", error);
    }
  }
};
