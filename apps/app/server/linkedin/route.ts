import { getAuthUser } from "@/queries/users/getAuthUser";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { organizationalEntityAclsResponse } from "@conquest/zod/schemas/types/linkedin";
import { Hono } from "hono";

export const linkedin = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/organizations", async (c) => {
    const { workspace } = c.get("user");

    const integration = workspace.integrations.find(
      (integration) => integration.details.source === "LINKEDIN",
    );

    const { details } = LinkedInIntegrationSchema.parse(integration);
    const { access_token } = details;

    const orgsResponse = await fetch(
      "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    const dataOrgs =
      (await orgsResponse.json()) as organizationalEntityAclsResponse;
    const orgsIds = dataOrgs.elements
      .map((org) => org.organizationalTarget.split(":").pop())
      .join(",");

    const response = await fetch(
      `https://api.linkedin.com/v2/organizations?ids=List(${orgsIds})`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    );

    const data = await response.json();

    return c.json(data);
  });
