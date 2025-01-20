import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import { type Posts, PostsSchema } from "@conquest/zod/types/linkedin";

type Props = {
  linkedin: LinkedInIntegration;
};

export const listPosts = async ({ linkedin }: Props) => {
  const { external_id, details } = linkedin;
  const { access_token } = details;

  const allPosts: Posts["elements"] = [];
  let start = 0;

  while (true) {
    const params = new URLSearchParams({
      author: `urn:li:organization:${external_id}`,
      q: "author",
      start: start.toString(),
      count: "100",
    });

    const postsResponse = await fetch(
      `https://api.linkedin.com/rest/posts?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    if (!postsResponse.ok) {
      const errorData = await postsResponse.json();
      throw new Error(
        `Failed to fetch LinkedIn posts: ${postsResponse.statusText}. Error: ${JSON.stringify(errorData)}`,
      );
    }

    const postsData = PostsSchema.parse(await postsResponse.json());
    allPosts.push(...postsData.elements);

    const total = postsData.paging?.total || 0;

    start += 100;
    if (start > total) break;
  }

  return allPosts;
};
