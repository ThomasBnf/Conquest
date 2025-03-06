import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { WebClient } from "@slack/web-api";
import { getUnixTime, subYears } from "date-fns";
import { listReplies } from "../slack/listReplies";

type Props = {
  web: WebClient;
  channel: Channel;
  workspace_id: string;
};

export const listMessages = async ({ web, channel, workspace_id }: Props) => {
  let cursor: string | undefined;

  do {
    const oneYearAgo = Math.floor(getUnixTime(subYears(new Date(), 1)));

    const result = await web.conversations.history({
      channel: channel.external_id ?? "",
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
        external_id: user,
        workspace_id,
      });

      if (!profile) continue;

      const activity = await createActivity({
        external_id: ts,
        activity_type_key: "slack:message",
        message: text,
        member_id: profile.member_id,
        channel_id: channel.id,
        created_at: new Date(Number(ts) * 1000),
        updated_at: new Date(Number(ts) * 1000),
        source: "Slack",
        workspace_id,
      });

      if (reactions?.length) {
        for (const reaction of reactions) {
          const { name } = reaction;

          for (const user of reaction.users ?? []) {
            const profile = await getProfile({
              external_id: user,
              workspace_id,
            });

            if (!profile) continue;

            await createActivity({
              activity_type_key: "slack:reaction",
              message: name,
              react_to: activity?.external_id,
              member_id: profile.member_id,
              channel_id: channel.id,
              created_at: new Date(Number(ts) * 1000),
              updated_at: new Date(Number(ts) * 1000),
              source: "Slack",
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
