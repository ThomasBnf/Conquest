import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getChannel } from "@conquest/clickhouse/channels/getChannel";
import { decrypt } from "@conquest/db/utils/decrypt";
import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { DiscourseProfile } from "@conquest/zod/schemas/profile.schema";
import { ReactionSchema } from "@conquest/zod/types/discourse";
import { startOfDay, subDays } from "date-fns";

type Props = {
  discourse: DiscourseIntegration;
  profile: DiscourseProfile;
};

export const createManyReactions = async ({ discourse, profile }: Props) => {
  const { details, workspaceId } = discourse;
  const { communityUrl, apiKey, apiKeyIv } = details;
  const { memberId, attributes } = profile;
  const { username } = attributes;

  const decryptedApiKey = await decrypt({
    accessToken: apiKey,
    iv: apiKeyIv,
  });

  const today = startOfDay(new Date());
  const last365Days = subDays(today, 365);

  let before = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${communityUrl}/discourse-reactions/posts/reactions.json?username=${username}${
        before ? `&before_reaction_user_id=${before}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "Api-Key": decryptedApiKey,
          "Api-Username": "system",
        },
      },
    );

    if (!response.ok) {
      hasMore = false;
      break;
    }

    const data = await response.json();
    const dataReactions = ReactionSchema.array().parse(data);

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
        externalId: String(category_id),
        workspaceId,
      });

      if (!channel) continue;

      await createActivity({
        externalId: `r/${id}`,
        activityTypeKey: "discourse:reaction",
        message: reaction_value,
        reactTo: `t/${topic_id}/${post.post_number}`,
        memberId,
        channelId: channel.id,
        createdAt: new Date(created_at),
        updatedAt: new Date(created_at),
        source: "Discourse",
        workspaceId,
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
