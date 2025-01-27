import { type SlackFile, createFiles } from "@/queries/slack/createFiles";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { WebClient } from "@slack/web-api";
import { createActivity } from "../activities/createActivity";
import { getMember } from "../members/getMember";

type Props = {
  web: WebClient;
  channel: Channel;
  reply_to?: string | null;
};

export const listReplies = async ({ web, channel, reply_to }: Props) => {
  const { workspace_id } = channel;

  let cursor: string | undefined;

  do {
    const { messages, response_metadata } = await web.conversations.replies({
      limit: 100,
      channel: channel.external_id ?? "",
      ts: reply_to ?? "",
      cursor,
    });

    for (const message of messages?.slice(1) ?? []) {
      console.log("replies", message);
      const { text, ts, user, reactions, files } = message;

      if (!user) continue;

      const member = await getMember({ slack_id: user, workspace_id });

      if (!member) continue;

      const activity = await createActivity({
        external_id: ts ?? null,
        activity_type_key: "slack:reply",
        message: text ?? "",
        reply_to,
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
          console.log("reaction", reaction);
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
              channel_id: channel.id,
              member_id: member.id,
              created_at: new Date(Number(ts) * 1000),
              updated_at: new Date(Number(ts) * 1000),
              workspace_id,
            });
          }
        }
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);
};
