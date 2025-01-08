import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import type { PostsResponse } from "@conquest/zod/types/linkedin";

type Props = {
  linkedin: LinkedInIntegration;
};

export const listPosts = async ({ linkedin }: Props) => {
  const { external_id, details } = linkedin;
  const { access_token } = details;

  const allPosts: PostsResponse["elements"] = [];

  let start = 0;
  let hasMore = true;

  while (hasMore) {
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

    const postsData = (await postsResponse.json()) as PostsResponse;
    allPosts.push(...postsData.elements);

    const total = postsData.paging?.total || 0;

    start += 100;
    hasMore = start < total;
  }

  return allPosts;
};
