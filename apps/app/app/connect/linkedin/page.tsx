import { LINKEDIN_SCOPES } from "@/constant";
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
    return redirect("settings/integrations/linkedin?error=invalid_code");
  }

  const data = await response.json();
  const { access_token } = data;

  const encryptedAccessToken = await encrypt(access_token);

  await createIntegration({
    external_id: null,
    details: {
      source: "Linkedin",
      name: "",
      access_token: encryptedAccessToken.token,
      iv: encryptedAccessToken.iv,
      scopes: LINKEDIN_SCOPES,
      user_id: "",
    },
    created_by: userId,
    workspace_id,
  });

  redirect("/settings/integrations/linkedin");
}
