import { decrypt } from "@conquest/db/lib/decrypt";
import { getIntegrationBySource } from "@conquest/db/queries/integration/getIntegrationBySource";
import { getRefreshToken } from "@conquest/db/queries/livestorm/getRefreshToken";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { protectedProcedure } from "../trpc";

export const getOrganization = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const integration = getIntegrationBySource({
      source: "LIVESTORM",
      workspace_id,
    });

    const livestorm = LivestormIntegrationSchema.parse(integration);

    const { details } = livestorm;
    const { access_token, access_token_iv, expires_in } = details;
    const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();

    const decryptedAccessToken = await decrypt({
      access_token: access_token,
      iv: access_token_iv,
    });

    let accessToken = decryptedAccessToken;

    if (isExpired) {
      accessToken = await getRefreshToken(livestorm);
    }

    console.log(accessToken);

    const response = await fetch(
      "https://api.livestorm.co/v1/organization?include=organization",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: "application/vnd.api+json",
        },
      },
    );

    return await response.json();
  },
);
