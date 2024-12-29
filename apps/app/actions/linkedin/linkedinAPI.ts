"use server";

import { authAction } from "@/lib/authAction";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";

export const linkedinAPI = authAction
  .metadata({
    name: "linkedinAPI",
  })
  .action(async ({ ctx: { user } }) => {
    const integrations = user.workspace.integrations;
    const linkedinIntegration = integrations.find(
      (integration) => integration.details.source === "LINKEDIN",
    );

    const accessToken =
      LinkedInIntegrationSchema.parse(linkedinIntegration).details.access_token;

    /* list organizations posts */
    // const postsResponse = await fetch(
    //   "https://api.linkedin.com/rest/posts?author=urn:li:organization:105844665&q=author&count=100",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "LinkedIn-Version": "202411",
    //       "Content-Type": "application/json",
    //     },
    //   },
    // );

    // const posts = await postsResponse.json();

    // for (const post of data.elements) {
    // list post comments
    // const response = await fetch(
    //   `https://api.linkedin.com/v2/socialActions/${post.id}/comments`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "LinkedIn-Version": "202411",
    //       "Content-Type": "application/json",
    //     },
    //   },
    // );

    // const commentData = await response.json();

    // for (const comment of commentData.elements) {
    // console.dir(comment, { depth: 1000 });

    // const likesResponse = await fetch(
    //   "https://api.linkedin.com/v2/socialActions/urn:li:activity:7274814775308517377/likes",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "LinkedIn-Version": "202411",
    //       "Content-Type": "application/json",
    //     },
    //   },
    // );

    // const likes = await likesResponse.json();

    // console.dir(likes, { depth: 1000 });

    // const response = await fetch(
    //   "https://api.linkedin.com/v2/people/(id:iuHQSczloT)",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "LinkedIn-Version": "202411",
    //       "Content-Type": "application/json",
    //       "X-RestLi-Protocol-Version": "2.0.0",
    //     },
    //   },
    // );

    // const commenterData = await response.json();
    // console.dir(commenterData, { depth: 1000 });
    // }
    // }
  });
