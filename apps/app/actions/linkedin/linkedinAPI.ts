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

    const response = await fetch(
      "https://api.linkedin.com/rest/memberSnapshotData?q=criteria&start=0&count=100&domain=PUBLICATIONS",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202312",
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    console.dir(data, { depth: 1000 });
  });
