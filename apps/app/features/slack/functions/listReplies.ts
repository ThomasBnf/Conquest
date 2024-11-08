import { safeAction } from "@/lib/safeAction";
import { ChannelSchema } from "@conquest/zod/channel.schema";
import { WebClient } from "@slack/web-api";
import { prisma } from "lib/prisma";
import { z } from "zod";
import { createReaction } from "./createReaction";

export const listReplies = safeAction
  .metadata({
    name: "listReplies",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
      channel: ChannelSchema,
      reply_to: z.string().optional(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { web, channel, reply_to, workspace_id } }) => {
    let cursor: string | undefined;

    do {
      const { messages, response_metadata } = await web.conversations.replies({
        limit: 100,
        channel: channel.external_id ?? "",
        ts: reply_to ?? "",
        cursor,
      });

      for (const message of messages?.slice(1) ?? []) {
        const { text, ts, user, reactions, files } = message;

        const member = await prisma.member.findUnique({
          where: {
            slack_id: user,
            workspace_id,
          },
        });

        if (member) {
          const activity = await prisma.activity.upsert({
            where: {
              external_id: ts,
            },
            update: {
              details: {
                source: "SLACK",
                type: "REPLY",
                message: text ?? "",
                files: files?.map(({ title, url_private }) => ({
                  title: title ?? "",
                  url: url_private ?? "",
                })),
                reply_to,
              },
            },
            create: {
              external_id: ts,
              details: {
                source: "SLACK",
                type: "REPLY",
                message: text ?? "",
                files: files?.map(({ title, url_private }) => ({
                  title: title ?? "",
                  url: url_private ?? "",
                })),
                reply_to,
              },
              channel_id: channel.id,
              member_id: member.id,
              workspace_id,
              created_at: new Date(Number(ts) * 1000),
              updated_at: new Date(Number(ts) * 1000),
            },
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
                  workspace_id,
                });
              }
            }
          }
        }
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });
