import { LINKEDIN_SCOPES } from "@/constant";
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

  const response = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
        client_secret: env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/linkedin`,
      }),
    },
  );

  if (!response.ok) {
    return redirect(
      `/${slug}/settings/integrations/linkedin?error=invalid_code`,
    );
  }

  const data = await response.json();
  const { access_token } = data;

  const encryptedAccessToken = await encrypt(access_token);

  await createIntegration({
    external_id: user.workspace_id,
    details: {
      source: "LINKEDIN",
      name: "",
      access_token: encryptedAccessToken.token,
      iv: encryptedAccessToken.iv,
      scopes: LINKEDIN_SCOPES,
      user_id: "",
    },
    created_by: user.id,
    workspace_id,
  });

  redirect("/settings/integrations/linkedin");
}
