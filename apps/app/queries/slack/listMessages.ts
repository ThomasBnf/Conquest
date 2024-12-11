import { type SlackFile, createFiles } from "@/features/slack/helpers/getFiles";
import { createActivity } from "@/queries/activities/createActivity";
import { getActivityType } from "@/queries/activity-type/getActivityType";
import type { Channel } from "@conquest/zod/channel.schema";
import type { WebClient } from "@slack/web-api";
import { getMember } from "../members/getMember";
import { createReaction } from "./createReaction";
import { listReplies } from "./listReplies";

type Props = {
  web: WebClient;
  channel: Channel;
  workspace_id: string;
};

export const listMessages = async ({ web, channel, workspace_id }: Props) => {
  let cursor: string | undefined;

  const type_post = await getActivityType({
    key: "slack:post",
    workspace_id,
  });
  const type_reaction = await getActivityType({
    key: "slack:reaction",
    workspace_id,
  });

  do {
    const result = await web.conversations.history({
      channel: channel.external_id ?? "",
      limit: 100,
      cursor,
    });

    const { messages, response_metadata } = result;

    for (const message of messages ?? []) {
      if (!message.user) continue;

      const { text, ts, user, reactions, reply_count, files, subtype } =
        message;

      const member = await getMember({
        id: user,
        source: "SLACK",
        workspace_id,
      });

      if (!member) continue;

      if (subtype === "channel_join") continue;

      if (member) {
        const activity = await createActivity({
          external_id: ts ?? null,
          activity_type_id: type_post.id,
          message: text ?? "",
          channel_id: channel.id,
          member_id: member.id,
          workspace_id,
          created_at: new Date(Number(ts) * 1000),
          updated_at: new Date(Number(ts) * 1000),
        });

        await createFiles({
          files: files as SlackFile[],
          activity_id: activity?.id,
        });

        if (reactions?.length) {
          for (const reaction of reactions) {
            const { name } = reaction;

            for (const user of reaction.users ?? []) {
              await createReaction({
                user,
                message: name ?? "",
                channel_id: channel.id,
                react_to: activity?.external_id,
                ts: (Number(ts) + 1).toString(),
                activity_type_id: type_reaction.id,
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
            workspace_id,
          });
        }
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);

  return { success: true };
};
