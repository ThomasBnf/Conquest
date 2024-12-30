import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import type { SocialActionsResponse } from "@conquest/zod/schemas/types/linkedin";

type Props = {
  linkedin: LinkedInIntegration;
  post_id: string;
};

export const listLikes = async ({ linkedin, post_id }: Props) => {
  const { access_token } = linkedin.details;

  const allLikes: SocialActionsResponse["elements"] = [];

  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      start: start.toString(),
      count: "600",
    });

    const likesResponse = await fetch(
      `https://api.linkedin.com/v2/socialActions/${post_id}/likes?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    if (!likesResponse.ok) {
      throw new Error(
        `Failed to fetch LinkedIn likes: ${likesResponse.statusText}`,
      );
    }

    const likesData = (await likesResponse.json()) as SocialActionsResponse;
    allLikes.push(...likesData.elements);

    const total = likesData.paging?.total || 0;

    start += 600;
    hasMore = start < total;
  }

  return allLikes;
};
