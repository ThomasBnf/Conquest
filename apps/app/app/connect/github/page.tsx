import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { encrypt } from "@conquest/db/utils/encrypt";
import { env } from "@conquest/env";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    code: string;
    installation_id: number;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { code, installation_id } = await searchParams;
  const { id: userId, workspaceId } = await getCurrentUser();

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: new URLSearchParams({
      code,
      client_id: env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/github`,
    }),
  });

  if (!response.ok) {
    return redirect("/settings/integrations/github?error=invalid_code");
  }

  const data = await response.json();
  const {
    access_token,
    expires_in,
    refresh_token,
    refresh_token_expires_in,
    scope,
  } = data;

  console.log("page connect", data);

  const encryptedAccessToken = await encrypt(access_token);
  const encryptedRefreshToken = await encrypt(refresh_token);

  await createIntegration({
    externalId: null,
    details: {
      source: "Github",
      accessToken: encryptedAccessToken.token,
      accessTokenIv: encryptedAccessToken.iv,
      refreshToken: encryptedRefreshToken.token,
      refreshTokenIv: encryptedRefreshToken.iv,
      refreshTokenExpires: refresh_token_expires_in,
      expiresIn: expires_in,
      installationId: installation_id,
      scope,
      repo: "",
      owner: "",
    },
    createdBy: userId,
    workspaceId,
  });

  redirect("/settings/integrations/github");
}
