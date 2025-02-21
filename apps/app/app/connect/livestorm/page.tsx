import { getCurrentUser } from "@/queries/getCurrentUser";
import { encrypt } from "@conquest/db/lib/encrypt";
import { createIntegration } from "@conquest/db/queries/integration/createIntegration";
import { getWorkspace } from "@conquest/db/queries/workspace/getWorkspace";
import { env } from "@conquest/env";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    code: string;
  };
};

export default async function Page({ searchParams: { code } }: Props) {
  const user = await getCurrentUser();
  const { slug, id: workspace_id } = await getWorkspace({
    id: user.workspace_id,
  });

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

  if (!response.ok) {
    return redirect(
      `/${slug}/settings/integrations/livestorm?error=invalid_code`,
    );
  }

  const data = await response.json();
  const { access_token, expires_in, refresh_token, scope } = data;

  console.log("access_token", access_token);

  const encryptedAccessToken = await encrypt(access_token);
  const encryptedRefreshToken = await encrypt(refresh_token);

  await createIntegration({
    external_id: user.workspace_id,
    details: {
      source: "LIVESTORM",
      name: "",
      access_token: encryptedAccessToken.token,
      access_token_iv: encryptedAccessToken.iv,
      refresh_token: encryptedRefreshToken.token,
      refresh_token_iv: encryptedRefreshToken.iv,
      expires_in,
      scope,
    },
    created_by: user.id,
    workspace_id,
  });

  redirect("/settings/integrations/livestorm");
}
