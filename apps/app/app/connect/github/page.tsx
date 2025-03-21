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
  const { id: userId, workspace_id } = await getCurrentUser();

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
  const { access_token, scope } = data;

  const encryptedAccessToken = await encrypt(access_token);
  await createIntegration({
    external_id: null,
    details: {
      source: "Github",
      access_token: encryptedAccessToken.token,
      iv: encryptedAccessToken.iv,
      installation_id,
      scope,
      repo: "",
      owner: "",
    },
    created_by: userId,
    workspace_id,
  });

  redirect("/settings/integrations/github");
}
