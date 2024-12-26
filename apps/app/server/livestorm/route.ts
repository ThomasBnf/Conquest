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

    try {
      const response = await fetch(
        "https://api.livestorm.co/v1/organization?include=organization",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            accept: "application/vnd.api+json",
          },
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();

        console.error(
          `Error in API call: ${response.status} ${response.statusText}`,

          errorBody,
        );

        throw new Error(
          `Failed to fetch organization: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      console.log("API Response Data:", data);

      return c.json(data);
    } catch (error) {
      console.error("Error in /organization route:", error);

      return c.json({ error }, 500);
    }
  });
