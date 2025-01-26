import { createActivity } from "@/queries/activities/createActivity";
import { type SlackFile, createFiles } from "@/queries/slack/createFiles";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { WebClient } from "@slack/web-api";
import { getMember } from "../members/getMember";
import { listReplies } from "./listReplies";

type Props = {
  web: WebClient;
  channel: Channel;
  workspace_id: string;
};

export const listMessages = async ({ web, channel, workspace_id }: Props) => {
  let cursor: string | undefined;

  do {
    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = now - 365 * 24 * 60 * 60;

    const result = await web.conversations.history({
      channel: channel.external_id ?? "",
      limit: 100,
      cursor,
      oldest: oneYearAgo.toString(),
    });

    const { messages, response_metadata } = result;

    for (const message of messages ?? []) {
      if (!message.user) continue;

      const { text, ts, user, reactions, reply_count, files, subtype } =
        message;

      if (subtype === "channel_join") continue;

      const member = await getMember({ slack_id: user, workspace_id });

      if (!member) continue;

      const activity = await createActivity({
        external_id: ts ?? null,
        activity_type_key: "slack:post",
        message: text ?? "",
        member_id: member.id,
        channel_id: channel.id,
        created_at: new Date(Number(ts) * 1000),
        updated_at: new Date(Number(ts) * 1000),
        workspace_id,
      });

      await createFiles({
        files: files as SlackFile[],
        activity_id: activity?.id,
      });

      if (reactions?.length) {
        for (const reaction of reactions) {
          const { name } = reaction;

          for (const user of reaction.users ?? []) {
            const member = await getMember({
              slack_id: user,
              workspace_id,
            });

            if (!member) continue;

            await createActivity({
              external_id: null,
              activity_type_key: "slack:reaction",
              message: name ?? "",
              react_to: activity?.external_id,
              member_id: member.id,
              channel_id: channel.id,
              created_at: new Date(Number(ts) * 1000),
              updated_at: new Date(Number(ts) * 1000),
              workspace_id,
            });
          }
        }
      }

      if (reply_count) {
        await listReplies({
          web,
          channel,
          reply_to: message.thread_ts,
        });
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);

  return { success: true };
};
