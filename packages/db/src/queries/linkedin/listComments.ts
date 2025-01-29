import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import {
  type SocialActions,
  SocialActionsSchema,
} from "@conquest/zod/types/linkedin";

type Props = {
  linkedin: LinkedInIntegration;
  post_id: string;
};

export const listComments = async ({ linkedin, post_id }: Props) => {
  const { access_token } = linkedin.details;

  const allComments: SocialActions["elements"] = [];
  let start = 0;

  while (true) {
    const params = new URLSearchParams({
      start: start.toString(),
      count: "600",
    });

    const response = await fetch(
      `https://api.linkedin.com/v2/socialActions/${post_id}/comments?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch LinkedIn comments: ${response.statusText}`,
      );
    }

    const commentsData = SocialActionsSchema.parse(await response.json());
    allComments.push(...commentsData.elements);

    const total = commentsData.paging?.total || 0;

    start += 600;
    if (start > total) break;
  }

  return allComments;
};
