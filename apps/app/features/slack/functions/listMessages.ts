import { getActivityType } from "@/features/activities-types/actions/getActivityType";
import { createActivity } from "@/features/activities/functions/createActivity";
import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ChannelSchema } from "@conquest/zod/channel.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { createReaction } from "./createReaction";
import { listReplies } from "./listReplies";

export const listMessages = safeAction
  .metadata({
    name: "listMessages",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
      channel: ChannelSchema,
      workspace_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { web, channel, workspace_id } }) => {
    let cursor: string | undefined;

    const rTypePost = await getActivityType({
      key: "slack:post",
      workspace_id,
    });
    const rTypeReaction = await getActivityType({
      key: "slack:reaction",
      workspace_id,
    });

    const type_post = rTypePost?.data;
    const type_reaction = rTypeReaction?.data;

    if (!type_post || !type_reaction) return;

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

        const member = await prisma.members.findUnique({
          where: {
            slack_id: user,
            workspace_id,
          },
        });

        if (subtype === "channel_join") continue;

        if (member && type_post) {
          const rActivity = await createActivity({
            external_id: ts ?? null,
            activity_type_id: type_post.id,
            message: text ?? "",
            // files: files?.map(({ title, url_private }) => ({
            //   title: title ?? "",
            //   url: url_private ?? "",
            // })),
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
  });
