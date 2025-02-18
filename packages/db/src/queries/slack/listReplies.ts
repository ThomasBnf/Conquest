import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { WebClient } from "@slack/web-api";
import { createActivity } from "../activity/createActivity";
import { getProfile } from "../profile/getProfile";

type Props = {
  web: WebClient;
  channel: Channel;
  reply_to?: string | null;
};

export const listReplies = async ({ web, channel, reply_to }: Props) => {
  const { workspace_id } = channel;

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
      const subtype = "subtype" in message ? message.subtype : undefined;

      if (!user) continue;
      if (subtype === "thread_broadcast") continue;

      const profile = await getProfile({
        external_id: user,
        workspace_id,
      });
      if (!profile) continue;

      const activity = await createActivity({
        external_id: ts ?? null,
        activity_type_key: "slack:reply",
        message: text ?? "",
        reply_to,
        member_id: profile.member_id,
        channel_id: channel.id,
        created_at: new Date(Number(ts) * 1000),
        updated_at: new Date(Number(ts) * 1000),
        source: "SLACK",
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
              external_id: null,
              activity_type_key: "slack:reaction",
              message: name ?? "",
              react_to: activity?.external_id,
              channel_id: channel.id,
              member_id: profile.member_id,
              created_at: new Date(Number(ts) * 1000),
              updated_at: new Date(Number(ts) * 1000),
              source: "SLACK",
              workspace_id,
            });
          }
        }
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);
};
