import { createActivity } from "@conquest/clickhouse/activity/createActivity";
import { getActivity } from "@conquest/clickhouse/activity/getActivity";
import { upsertActivity } from "@conquest/clickhouse/activity/upsertActivity";
import { getChannel } from "@conquest/clickhouse/channel/getChannel";
import type { DiscourseProfile } from "@conquest/zod/schemas/profile.schema";
import { startOfDay, subDays } from "date-fns";
import type DiscourseAPI from "discourse2";

type Props = {
  client: DiscourseAPI;
  profile: DiscourseProfile;
};

export const createManyActivities = async ({ client, profile }: Props) => {
  const { attributes, workspaceId } = profile;
  const { username } = attributes;

  const today = startOfDay(new Date());
  const last365Days = subDays(today, 365);

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { user_actions } = await client.listUserActions({
      username,
      filter: "1,4,5,6,15",
      offset,
    });

    if (!user_actions?.length) {
      hasMore = false;
      break;
    }

    const recentActions = user_actions.filter(
      (action) => new Date(action.created_at) >= last365Days,
    );

    if (recentActions.length === 0) {
      hasMore = false;
      break;
    }

    for (const action of recentActions) {
      const {
        action_type,
        created_at,
        category_id,
        excerpt,
        post_id,
        post_number,
        topic_id,
        title,
      } = action;

      const channel = await getChannel({
        externalId: String(category_id),
        workspaceId,
      });

      if (!channel) continue;

      switch (action_type) {
        case 1: {
          await createActivity({
            activityTypeKey: "discourse:reaction",
            message: "like",
            reactTo: `t/${topic_id}/${post_number}`,
            memberId: profile.memberId,
            channelId: channel?.id,
            createdAt: new Date(created_at),
            updatedAt: new Date(created_at),
            source: "Discourse",
            workspaceId,
          });
          break;
        }
        case 4: {
          await createActivity({
            externalId: `t/${topic_id}`,
            activityTypeKey: "discourse:topic",
            title,
            message: excerpt,
            memberId: profile.memberId,
            channelId: channel?.id,
            createdAt: new Date(created_at),
            updatedAt: new Date(created_at),
            source: "Discourse",
            workspaceId,
          });
          break;
        }
        case 5: {
          const activity = await getActivity({
            externalId: `p/${post_id}`,
            workspaceId,
          });

          if (activity) break;

          await createActivity({
            externalId: `p/${post_id}`,
            activityTypeKey: "discourse:reply",
            message: excerpt,
            replyTo: `t/${topic_id}/${post_number}`,
            memberId: profile.memberId,
            channelId: channel?.id,
            createdAt: new Date(created_at),
            updatedAt: new Date(created_at),
            source: "Discourse",
            workspaceId,
          });
          break;
        }
        case 15: {
          await upsertActivity({
            externalId: `p/${post_id}`,
            activityTypeKey: "discourse:solved",
            message: excerpt,
            replyTo: `t/${topic_id}/${post_number}`,
            memberId: profile.memberId,
            channelId: channel?.id,
            createdAt: new Date(created_at),
            updatedAt: new Date(created_at),
            source: "Discourse",
            workspaceId,
          });
          break;
        }
      }
    }
    hasMore = user_actions.length === 30;
    offset += 30;
  }
};
