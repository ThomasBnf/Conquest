"use server";

import { ChannelSchema } from "@conquest/zod/channel.schema";
import { WebClient } from "@slack/web-api";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";
import { createActivity } from "../activities/createActivity";
import { createReaction } from "./createReaction";

export const listReplies = authAction
  .metadata({
    name: "listReplies",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
      channel: ChannelSchema,
      reference: z.string().cuid().optional(),
      ts: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { web, channel, ts, reference } }) => {
    const workspace_id = ctx.user.workspace_id;
    let cursor: string | undefined;

    do {
      const { messages, response_metadata } = await web.conversations.replies({
        limit: 100,
        channel: channel.external_id ?? "",
        ts,
        cursor,
      });

      for (const message of messages?.slice(1) ?? []) {
        const { text, ts, user, reactions, attachments, files } = message;

        const contact = await prisma.contact.findUnique({
          where: {
            slack_id: user,
            workspace_id,
          },
        });

        if (contact) {
          const rActivity = await createActivity({
            details: {
              source: "SLACK",
              type: "REPLY",
              message: text ?? "",
              reference,
              attachments: attachments?.map(({ from_url, title_link }) => ({
                title: title_link ?? "",
                url: from_url ?? "",
              })),
              files: files?.map(({ title, url_private }) => ({
                title: title ?? "",
                url: url_private ?? "",
              })),
              ts: ts ?? "",
            },
            channel_id: channel.id,
            contact_id: contact.id,
            created_at: new Date(Number(ts) * 1000),
            updated_at: new Date(Number(ts) * 1000),
          });

          const activity = rActivity?.data;

          if (!activity) continue;

          if (reactions?.length) {
            for (const reaction of reactions) {
              const { name } = reaction;

              for (const user of reaction.users ?? []) {
                await createReaction({
                  user,
                  message: name ?? "",
                  reference: activity.id,
                  channel_id: channel.id,
                  ts: message.ts ?? "",
                });
              }
            }
          }
        }
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });
