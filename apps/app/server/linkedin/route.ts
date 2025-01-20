import { env } from "@/env.mjs";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  ListOrganizationsSchema,
  OrganizationsSchema,
} from "@conquest/zod/types/linkedin";
import { Hono } from "hono";
import { createHmac } from "node:crypto";

const generateChallengeResponse = (
  challengeCode: string,
  clientSecret: string,
) => {
  const hmac = createHmac("sha256", clientSecret);
  hmac.update(challengeCode);
  return hmac.digest("hex");
};

export const linkedin = new Hono()
  .get("/", async (c) => {
    const searchParams = new URL(c.req.url).searchParams;
    const challengeCode = searchParams.get("challengeCode")!;

    const clientSecret = env.LINKEDIN_CLIENT_SECRET as string;
    const challengeResponse = generateChallengeResponse(
      challengeCode,
      clientSecret,
    );

    return c.json({ challengeCode, challengeResponse });
  })
  .post("/", async (c) => {
    const body = await c.req.json();

    console.log(body);

    return c.json({ success: true });
  })
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

    const parsedIntegration = LinkedInIntegrationSchema.parse(integration);
    const { details } = parsedIntegration;
    const { access_token } = details;

    const response = await fetch(
      "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
        },
      },
    );

    const organizationsList = ListOrganizationsSchema.parse(
      await response.json(),
    );

    const userId = organizationsList.elements[0]?.roleAssignee.split(":")[3];

    console.log("userId", userId);

    if (userId) {
      await updateIntegration({
        id: parsedIntegration?.id,
        details: {
          ...parsedIntegration?.details,
          user_id: userId,
        },
      });
    }

    const organizationsIds = organizationsList.elements
      .map((org) => org.organizationalTarget.split(":").pop())
      .join(",");

    const orgsResponse = await fetch(
      `https://api.linkedin.com/v2/organizations?ids=List(${organizationsIds})`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    );

    return c.json(OrganizationsSchema.parse(await orgsResponse.json()));
  });
