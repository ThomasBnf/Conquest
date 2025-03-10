import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getActivity } from "@conquest/clickhouse/activities/getActivity";
import { upsertActivity } from "@conquest/clickhouse/activities/upsertActivity";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import type { DiscourseProfile } from "@conquest/zod/schemas/profile.schema";
import { startOfDay, subDays } from "date-fns";
import type DiscourseAPI from "discourse2";

type Props = {
  client: DiscourseAPI;
  profile: DiscourseProfile;
};

export const createManyActivities = async ({ client, profile }: Props) => {
  const { attributes, workspace_id } = profile;
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
        external_id: String(category_id),
        workspace_id,
      });

      if (!channel) continue;

      switch (action_type) {
        case 1: {
          await createActivity({
            activity_type_key: "discourse:reaction",
            message: "like",
            react_to: `t/${topic_id}/${post_number}`,
            member_id: profile.member_id,
            channel_id: channel?.id,
            created_at: new Date(created_at),
            updated_at: new Date(created_at),
            source: "Discourse",
            workspace_id,
          });
          break;
        }
        case 4: {
          await createActivity({
            external_id: `t/${topic_id}`,
            activity_type_key: "discourse:topic",
            title,
            message: excerpt,
            member_id: profile.member_id,
            channel_id: channel?.id,
            created_at: new Date(created_at),
            updated_at: new Date(created_at),
            source: "Discourse",
            workspace_id,
          });
          break;
        }
        case 5: {
          const activity = await getActivity({
            external_id: `p/${post_id}`,
            workspace_id,
          });

          if (activity) break;

          await createActivity({
            external_id: `p/${post_id}`,
            activity_type_key: "discourse:reply",
            message: excerpt,
            reply_to: `t/${topic_id}/${post_number}`,
            member_id: profile.member_id,
            channel_id: channel?.id,
            created_at: new Date(created_at),
            updated_at: new Date(created_at),
            source: "Discourse",
            workspace_id,
          });
          break;
        }
        case 15: {
          await upsertActivity({
            external_id: `p/${post_id}`,
            activity_type_key: "discourse:solved",
            message: excerpt,
            reply_to: `t/${topic_id}/${post_number}`,
            member_id: profile.member_id,
            channel_id: channel?.id,
            created_at: new Date(created_at),
            updated_at: new Date(created_at),
            source: "Discourse",
            workspace_id,
          });
          break;
        }
      }
    }
    hasMore = user_actions.length === 30;
    offset += 30;
  }
};
