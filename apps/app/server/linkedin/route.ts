import { getAuthUser } from "@/queries/users/getAuthUser";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { Orgnaization } from "@conquest/zod/schemas/types/linkedin";
import { Hono } from "hono";

export const linkedin = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/get-company", async (c) => {
    const { workspace } = c.get("user");

    const linkedinIntegration = workspace.integrations.find(
      (integration) => integration.details.source === "LINKEDIN",
    );

    const { access_token } =
      LinkedInIntegrationSchema.parse(linkedinIntegration).details;

    const responseOrg = await fetch(
      "https://api.linkedin.com/rest/organizations/104941091",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    const dataOrg = (await responseOrg.json()) as Orgnaization;
    const { id, localizedName, localizedDescription } = dataOrg;

    return c.json({ id, localizedName, localizedDescription });
  });

104941091;
