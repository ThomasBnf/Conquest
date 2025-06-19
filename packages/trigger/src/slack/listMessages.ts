import { createActivity } from "@conquest/db/activity/createActivity";
import { getProfile } from "@conquest/db/profile/getProfile";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { WebClient } from "@slack/web-api";
import { getUnixTime, subYears } from "date-fns";
import { listReplies } from "./listReplies";

type Props = {
  web: WebClient;
  channel: Channel;
  workspaceId: string;
};

export const listMessages = async ({ web, channel, workspaceId }: Props) => {
  let cursor: string | undefined;

  do {
    const oneYearAgo = Math.floor(getUnixTime(subYears(new Date(), 1)));

    const result = await web.conversations.history({
      channel: channel.externalId ?? "",
      limit: 100,
      cursor,
      oldest: oneYearAgo.toString(),
    });

    const { messages, response_metadata } = result;

    for (const message of messages ?? []) {
      if (!message.user) continue;

      const { text, ts, user, reactions, reply_count, subtype } = message;

      if (subtype === "channel_join") continue;

      const profile = await getProfile({
        externalId: user,
        workspaceId,
      });

      if (!profile) continue;

      const activity = await createActivity({
        externalId: ts,
        activityTypeKey: "slack:message",
        message: text,
        memberId: profile.memberId,
        channelId: channel.id,
        createdAt: new Date(Number(ts) * 1000),
        updatedAt: new Date(Number(ts) * 1000),
        source: "Slack",
        workspaceId,
      });

      if (reactions?.length) {
        for (const reaction of reactions) {
          const { name } = reaction;

          for (const user of reaction.users ?? []) {
            const profile = await getProfile({
              externalId: user,
              workspaceId,
            });

            if (!profile) continue;

            await createActivity({
              activityTypeKey: "slack:reaction",
              message: name,
              reactTo: activity?.externalId,
              memberId: profile.memberId,
              channelId: channel.id,
              createdAt: new Date(Number(ts) * 1000),
              updatedAt: new Date(Number(ts) * 1000),
              source: "Slack",
              workspaceId,
            });
          }
        }
      }

      if (reply_count) {
        await listReplies({
          web,
          channel,
          replyTo: message.thread_ts,
        });
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);

  return { success: true };
};
