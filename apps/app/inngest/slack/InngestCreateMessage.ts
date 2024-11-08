import { createActivity } from "@/features/activities/functions/createActivity";
import { createReaction } from "@/features/slack/functions/createReaction";
import { listReplies } from "@/features/slack/functions/listReplies";
import { prisma } from "@/lib/prisma";
import { WebClient } from "@slack/web-api";
import { inngest } from "../client";

export const InngestCreateMessage = inngest.createFunction(
  { id: "create-message" },
  { event: "slack/create-message" },
  async ({ event, step }) => {
    const { channel, workspace_id, token } = event.data;
    const web = new WebClient(token);

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

        await step.run(`createMessage-${message.ts}`, async () => {
          const { text, ts, user, reactions, reply_count, files, subtype } =
            message;

          const member = await prisma.member.findUnique({
            where: {
              slack_id: user,
              workspace_id,
            },
          });

          if (subtype === "channel_join") return;

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

            if (!activity) return;

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
        });
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  },
);
