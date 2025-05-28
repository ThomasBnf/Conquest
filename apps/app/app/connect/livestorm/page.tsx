import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { encrypt } from "@conquest/db/utils/encrypt";
import { env } from "@conquest/env";
import { getOrganization } from "@conquest/trigger/livestorm/getOrganization";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    code: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { code } = await searchParams;
  const { id: userId, workspaceId } = await getCurrentUser();

  const params = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
    client_secret: env.LIVESTORM_CLIENT_SECRET,
    redirect_uri: `${env.NEXT_PUBLIC_URL}/connect/livestorm`,
  });

  const response = await fetch(
    `https://app.livestorm.co/oauth/token?${params.toString()}`,
    {
      method: "POST",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    redirect("/settings/integrations/livestorm?message=invalid_code");
  }

  const { access_token, expires_in, refresh_token, scope } = data;

  const organization = await getOrganization({ access_token });
  const { included } = organization ?? {};

  const organization_id = included?.at(0)?.id ?? "";
  const organization_name = included?.at(0)?.attributes.name ?? "";

  const integration = await getIntegration({ externalId: organization_id });

  if (integration) {
    redirect("/settings/integrations/livestorm?message=already_connected");
  }

  const encryptedAccessToken = await encrypt(access_token);
  const encryptedRefreshToken = await encrypt(refresh_token);

  await createIntegration({
    externalId: organization_id,
    details: {
      source: "Livestorm",
      name: organization_name,
      accessToken: encryptedAccessToken.token,
      accessTokenIv: encryptedAccessToken.iv,
      refreshToken: encryptedRefreshToken.token,
      refreshTokenIv: encryptedRefreshToken.iv,
      expiresIn: expires_in,
      scope,
    },
    createdBy: userId,
    workspaceId,
  });

  redirect("/settings/integrations/livestorm");
}
