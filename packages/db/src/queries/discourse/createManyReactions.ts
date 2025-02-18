import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { DiscourseProfile } from "@conquest/zod/schemas/profile.schema";
import type { Reaction } from "@conquest/zod/types/discourse";
import { startOfDay, subDays } from "date-fns";
import { createActivity } from "../activity/createActivity";
import { getChannel } from "../channel/getChannel";

type Props = {
  discourse: DiscourseIntegration;
  profile: DiscourseProfile;
};

export const createManyReactions = async ({ discourse, profile }: Props) => {
  const { details, workspace_id } = discourse;
  const { community_url, api_key } = details;
  const { member_id, attributes } = profile;
  const { username } = attributes;

  const today = startOfDay(new Date());
  const last365Days = subDays(today, 365);

  let before = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${community_url}/discourse-reactions/posts/reactions.json?username=${username}${
        before ? `&before_reaction_user_id=${before}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "Api-Key": api_key,
          "Api-Username": "system",
        },
      },
    );

    const dataReactions = (await response.json()) as Reaction[];

    if (!response.ok) {
      hasMore = false;
      break;
    }

    const recentReactions = dataReactions.filter(
      (reaction) => new Date(reaction.post.created_at) >= last365Days,
    );

    if (recentReactions.length === 0) {
      hasMore = false;
      break;
    }

    for (const reactionData of recentReactions) {
      const { id, reaction, post } = reactionData;
      const { category_id, topic_id, created_at } = post;
      const { reaction_value } = reaction;

      if (!category_id) continue;

      const channel = await getChannel({
        external_id: String(category_id),
        workspace_id,
      });

      if (!channel) continue;

      await createActivity({
        external_id: `r/${id}`,
        activity_type_key: "discourse:reaction",
        message: reaction_value,
        react_to: `t/${topic_id}/${post.post_number}`,
        member_id: member_id,
        channel_id: channel.id,
        created_at: new Date(created_at),
        updated_at: new Date(created_at),
        source: "DISCOURSE",
        workspace_id,
      });
    }

    const lastItem = dataReactions.at(-1);

    if (!lastItem) {
      hasMore = false;
      break;
    }

    before = lastItem.id;
    hasMore = dataReactions.length === 20;
  }
};
