import { prisma } from "@/lib/prisma";
import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Reaction } from "@conquest/zod/schemas/types/discourse";
import { getActivityType } from "../activity-type/getActivityType";

type Props = {
  discourse: DiscourseIntegration;
  member: Member;
};

export const createManyReactions = async ({ discourse, member }: Props) => {
  const { details, workspace_id } = discourse;
  const { community_url, api_key } = details;
  const { username } = member;

  const reaction_type = await getActivityType({
    workspace_id,
    key: "discourse:reaction",
  });

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

    for (const reactionData of dataReactions) {
      const { id, reaction, post } = reactionData as Reaction;
      const { category_id, topic_id, created_at } = post;
      const { reaction_value } = reaction;

      const channel = await prisma.channels.findFirst({
        where: {
          external_id: String(category_id),
          workspace_id,
        },
      });

      if (!channel) continue;

      await prisma.activities.create({
        data: {
          external_id: String(id),
          activity_type_id: reaction_type.id,
          message: reaction_value,
          member_id: member.id,
          channel_id: channel.id,
          thread_id: String(topic_id),
          react_to: String(post.id),
          created_at,
          workspace_id,
        },
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
