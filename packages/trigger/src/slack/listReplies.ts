import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { WebClient } from "@slack/web-api";

type Props = {
  web: WebClient;
  channel: Channel;
  replyTo?: string | null;
};

export const listReplies = async ({ web, channel, replyTo }: Props) => {
  const { workspaceId } = channel;

  let cursor: string | undefined;

  do {
    const { messages, response_metadata } = await web.conversations.replies({
      limit: 100,
      channel: channel.externalId ?? "",
      ts: replyTo ?? "",
      cursor,
    });

    for (const message of messages?.slice(1) ?? []) {
      const { text, ts, user, reactions } = message;
      const subtype = "subtype" in message ? message.subtype : undefined;

      if (!user) continue;
      if (subtype === "thread_broadcast") continue;

      const profile = await getProfile({
        externalId: user,
        workspaceId,
      });

      if (!profile) continue;

      const activity = await createActivity({
        externalId: ts,
        activityTypeKey: "slack:reply",
        message: text,
        replyTo: replyTo ?? "",
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
              channelId: channel.id,
              memberId: profile.memberId,
              createdAt: new Date(Number(ts) * 1000),
              updatedAt: new Date(Number(ts) * 1000),
              source: "Slack",
              workspaceId,
            });
          }
        }
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);
};
