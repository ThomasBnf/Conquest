import { type SlackFile, createFiles } from "@/features/slack/helpers/getFiles";
import type { Channel } from "@conquest/zod/channel.schema";
import type { WebClient } from "@slack/web-api";
import { prisma } from "lib/prisma";
import { getActivityType } from "../activity-type/getActivityType";
import { createReaction } from "./createReaction";

type Props = {
  web: WebClient;
  channel: Channel;
  reply_to?: string | null;
  workspace_id: string;
};

export const listReplies = async ({
  web,
  channel,
  reply_to,
  workspace_id,
}: Props) => {
  let cursor: string | undefined;

  const type_reply = await getActivityType({
    key: "slack:reply",
    workspace_id,
  });
  const type_reaction = await getActivityType({
    key: "slack:reaction",
    workspace_id,
  });

  if (!type_reply || !type_reaction) return;

  do {
    const { messages, response_metadata } = await web.conversations.replies({
      limit: 100,
      channel: channel.external_id ?? "",
      ts: reply_to ?? "",
      cursor,
    });

    for (const message of messages?.slice(1) ?? []) {
      const { text, ts, user, reactions, files } = message;

      const member = await prisma.members.findUnique({
        where: {
          slack_id: user,
          workspace_id,
        },
      });

      if (member) {
        const activity = await prisma.activities.upsert({
          where: {
            external_id: ts,
          },
          update: {
            message: text ?? "",
            activity_type_id: type_reply.id,
            reply_to,
          },
          create: {
            external_id: ts,
            message: text ?? "",
            activity_type_id: type_reply.id,
            reply_to,
            channel_id: channel.id,
            member_id: member.id,
            workspace_id,
            created_at: new Date(Number(ts) * 1000),
            updated_at: new Date(Number(ts) * 1000),
          },
        });

        await createFiles({
          files: files as SlackFile[],
          activity_id: activity.id,
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
                ts: message.ts ?? "",
                activity_type_id: type_reaction.id,
                workspace_id,
              });
            }
          }
        }
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);
};
