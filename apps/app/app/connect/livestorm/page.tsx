import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { getOrganization } from "@conquest/db/livestorm/getOrganization";
import { encrypt } from "@conquest/db/utils/encrypt";
import { env } from "@conquest/env";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    code: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { code } = await searchParams;
  const { id: userId, workspace_id } = await getCurrentUser();

  const params = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
    client_secret: env.LIVESTORM_CLIENT_SECRET,
    redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/livestorm`,
  });

  const response = await fetch(
    `https://app.livestorm.co/oauth/token?${params.toString()}`,
    {
      method: "POST",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return redirect("settings/integrations/livestorm?error=invalid_code");
  }

  const { access_token, expires_in, refresh_token, scope } = data;

  const organization = await getOrganization({ access_token });
  const { included } = organization ?? {};

  const organization_id = included?.at(0)?.id ?? "";
  const organization_name = included?.at(0)?.attributes.name ?? "";

  const integration = await getIntegration({ external_id: organization_id });

  if (integration) {
    return redirect("/settings/integrations/livestorm?error=already_connected");
  }

  const encryptedAccessToken = await encrypt(access_token);
  const encryptedRefreshToken = await encrypt(refresh_token);

  await createIntegration({
    external_id: organization_id,
    details: {
      source: "Livestorm",
      name: organization_name,
      access_token: encryptedAccessToken.token,
      access_token_iv: encryptedAccessToken.iv,
      refresh_token: encryptedRefreshToken.token,
      refresh_token_iv: encryptedRefreshToken.iv,
      expires_in,
      scope,
    },
    created_by: userId,
    workspace_id,
  });

  redirect("/settings/integrations/livestorm");
}
