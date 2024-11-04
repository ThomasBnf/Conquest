import { createActivity } from "@/features/activities/functions/createActivity";
import { prisma } from "@/lib/prisma";
import { ChannelSchema } from "@conquest/zod/channel.schema";
import { WebClient } from "@slack/web-api";
import { authAction } from "lib/authAction";
import { z } from "zod";
import { createReaction } from "./createReaction";
import { listReplies } from "./listReplies";

export const listMessages = authAction
  .metadata({
    name: "listMessages",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
      channel: ChannelSchema,
    }),
  )
  .action(async ({ ctx, parsedInput: { web, channel } }) => {
    const workspace_id = ctx.user.workspace_id;

    let cursor: string | undefined;

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

        const member = await prisma.member.findUnique({
          where: {
            slack_id: user,
            workspace_id,
          },
        });

        if (subtype === "channel_join") continue;

        if (member) {
          const rActivity = await createActivity({
            external_id: ts ?? null,
            details: {
              source: "SLACK",
              type: "POST",
              message: text ?? "",
              files: files?.map(({ title, url_private }) => ({
                title: title ?? "",
                url: url_private ?? "",
              })),
            },
            channel_id: channel.id,
            member_id: member.id,
            workspace_id,
            created_at: new Date(Number(ts) * 1000),
            updated_at: new Date(Number(ts) * 1000),
          });

          const activity = rActivity?.data;

          if (!activity) break;

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
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });
