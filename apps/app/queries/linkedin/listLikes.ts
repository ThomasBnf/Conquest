import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import {
  type SocialActions,
  SocialActionsSchema,
} from "@conquest/zod/types/linkedin";

type Props = {
  linkedin: LinkedInIntegration;
  post_id: string;
};

export const listLikes = async ({ linkedin, post_id }: Props) => {
  const { access_token } = linkedin.details;

  const allLikes: SocialActions["elements"] = [];
  let start = 0;

  while (true) {
    const params = new URLSearchParams({
      start: start.toString(),
      count: "600",
    });

    const response = await fetch(
      `https://api.linkedin.com/v2/socialActions/${post_id}/likes?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn likes: ${response.statusText}`);
    }

    const likesData = SocialActionsSchema.parse(await response.json());
    allLikes.push(...likesData.elements);

    const total = likesData.paging?.total || 0;

    start += 600;
    if (start > total) break;
  }

  return allLikes;
};
