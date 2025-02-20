import { env } from "@conquest/env";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import { decrypt } from "../../lib/decrypt";
import { encrypt } from "../../lib/encrypt";
import { updateIntegration } from "../integration/updateIntegration";

export const getRefreshToken = async (integration: LivestormIntegration) => {
  const { id, details } = integration;
  const { refresh_token, refresh_token_iv } = details;

  const decryptedRefreshToken = await decrypt({
    access_token: refresh_token,
    iv: refresh_token_iv,
  });

  console.log("decryptedRefreshToken", decryptedRefreshToken);

  const params = new URLSearchParams({
    client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
    client_secret: env.LIVESTORM_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: decryptedRefreshToken,
  });

  const response = await fetch(
    `https://app.livestorm.co/oauth/token?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${decryptedRefreshToken}`,
      },
    },
  );

  const data = await response.json();

  const encryptedAccessToken = await encrypt(data.access_token);
  const encryptedRefreshToken = await encrypt(data.refresh_token);

  await updateIntegration({
    id,
    details: {
      ...details,
      access_token: encryptedAccessToken.token,
      access_token_iv: encryptedAccessToken.iv,
      refresh_token: encryptedRefreshToken.token,
      refresh_token_iv: encryptedRefreshToken.iv,
      expires_in: data.expires_in,
      scope: data.scope,
    },
  });

  return data.access_token;
};
