import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { encrypt } from "@conquest/db/utils/encrypt";
import { env } from "@conquest/env";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";

type Props = {
  livestorm: LivestormIntegration;
};

export const getRefreshToken = async ({ livestorm }: Props) => {
  const { id, details, workspaceId } = livestorm;
  const { refreshToken, refreshTokenIv } = details;

  const decryptedRefreshToken = await decrypt({
    accessToken: refreshToken,
    iv: refreshTokenIv,
  });

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
      accessToken: encryptedAccessToken.token,
      accessTokenIv: encryptedAccessToken.iv,
      refreshToken: encryptedRefreshToken.token,
      refreshTokenIv: encryptedRefreshToken.iv,
      expiresIn: data.expires_in,
      scope: data.scope,
    },
    workspaceId,
  });

  return data.access_token;
};
