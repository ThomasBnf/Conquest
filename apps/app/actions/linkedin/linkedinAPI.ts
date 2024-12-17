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

    // const response = await fetch(
    //   "https://api.linkedin.com/rest/posts?author=urn:li:organization:105844665&q=author&count=100",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "LinkedIn-Version": "202411",
    //       "Content-Type": "application/json",
    //     },
    //   },
    // );

    // const data = await response.json();

    // for (const post of data.elements) {
    //   console.log(post.id);
    //   const response = await fetch(
    //     `https://api.linkedin.com/v2/socialActions/${post.id}/comments`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${accessToken}`,
    //         "LinkedIn-Version": "202411",
    //         "Content-Type": "application/json",
    //       },
    //     },
    //   );

    //   const commentData = await response.json();

    //   for (const comment of commentData.elements) {
    //     console.log(comment.id);

    const response = await fetch(
      "https://api.linkedin.com/v2/people/(id:urn:li:person:J45AnYWgZv)",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    const commenterData = await response.json();
    console.dir(commenterData, { depth: 1000 });
    //   }
    // }
  });
