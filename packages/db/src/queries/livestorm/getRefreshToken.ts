import { env } from "@conquest/env";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import { updateIntegration } from "../integrations/updateIntegration";

export const getRefreshToken = async (integration: LivestormIntegration) => {
  const { id, details } = integration;
  const { refresh_token } = details;

  const params = new URLSearchParams({
    client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID!,
    client_secret: env.LIVESTORM_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refresh_token,
  });

  const response = await fetch(
    `https://app.livestorm.co/oauth/token?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refresh_token}`,
      },
    },
  );

  const data = await response.json();

  await updateIntegration({
    id,
    details: {
      ...details,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      scope: data.scope,
    },
  });

  return data.access_token;
};
