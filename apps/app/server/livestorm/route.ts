import { getRefreshToken } from "@/queries/livestorm/getRefreshToken";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { Hono } from "hono";

export const livestorm = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/organization", async (c) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    const { workspace } = user;

    const integration = workspace.integrations.find(
      (integration) => integration.details.source === "LIVESTORM",
    );

    const parsedIntegration = LivestormIntegrationSchema.parse(integration);

    const { details } = parsedIntegration;
    const { access_token, expires_in } = details;
    const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();

    let accessToken = access_token;

    if (isExpired) {
      accessToken = await getRefreshToken(parsedIntegration);
    }

    const response = await fetch(
      "https://api.livestorm.co/v1/organization?include=organization",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: "application/vnd.api+json",
        },
      },
    );

    const data = await response.json();
    return c.json(data);
  });
