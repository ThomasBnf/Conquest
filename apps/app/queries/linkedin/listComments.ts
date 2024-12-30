import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import type { SocialActionsResponse } from "@conquest/zod/schemas/types/linkedin";

type Props = {
  linkedin: LinkedInIntegration;
  post_id: string;
};

export const listComments = async ({ linkedin, post_id }: Props) => {
  const { access_token } = linkedin.details;

  const allComments: SocialActionsResponse["elements"] = [];

  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      start: start.toString(),
      count: "600",
    });

    const commentsResponse = await fetch(
      `https://api.linkedin.com/v2/socialActions/${post_id}/comments?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    if (!commentsResponse.ok) {
      throw new Error(
        `Failed to fetch LinkedIn comments: ${commentsResponse.statusText}`,
      );
    }

    const commentsData =
      (await commentsResponse.json()) as SocialActionsResponse;
    allComments.push(...commentsData.elements);

    const total = commentsData.paging?.total || 0;

    start += 600;
    hasMore = start < total;
  }

  return allComments;
};
