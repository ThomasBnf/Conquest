import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
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

  console.log("response", response);

  const data = await response.json();
  console.log(data);

  if (!response.ok) {
    return redirect("settings/integrations/livestorm?error=invalid_code");
  }

  const { access_token, expires_in, refresh_token, scope } = data;

  console.log("data", data);

  const encryptedAccessToken = await encrypt(access_token);
  const encryptedRefreshToken = await encrypt(refresh_token);

  const integration = await createIntegration({
    external_id: null,
    details: {
      source: "Livestorm",
      name: "",
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

  console.log("integration", integration);

  redirect("/settings/integrations/livestorm");
}
