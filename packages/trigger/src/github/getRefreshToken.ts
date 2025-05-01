import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { encrypt } from "@conquest/db/utils/encrypt";
import { env } from "@conquest/env";
import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";

type Props = {
  github: GithubIntegration;
};

export const getRefreshToken = async ({ github }: Props) => {
  const { id, details, workspaceId } = github;
  const { refreshToken, refreshTokenIv } = details;

  const decryptedRefreshToken = await decrypt({
    accessToken: refreshToken,
    iv: refreshTokenIv,
  });

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: decryptedRefreshToken,
    }),
  });

  const data = await response.json();

  const {
    access_token,
    scope,
    expires_in,
    refresh_token,
    refresh_token_expires_in,
  } = data;

  const encryptedAccessToken = await encrypt(access_token);
  const encryptedRefreshToken = await encrypt(refresh_token);

  await updateIntegration({
    id,
    details: {
      ...details,
      accessToken: encryptedAccessToken.token,
      accessTokenIv: encryptedAccessToken.iv,
      refreshToken: encryptedRefreshToken.token,
      refreshTokenIv: encryptedRefreshToken.iv,
      refreshTokenExpires: refresh_token_expires_in,
      expiresIn: expires_in,
      scope,
    },
    workspaceId,
  });

  return access_token;
};
