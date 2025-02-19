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
    return redirect(`/${slug}/settings/integrations/github?error=invalid_code`);
  }

  const data = await response.json();
  console.log(data);
  const { access_token, scope } = data;

  const encryptedAccessToken = await encrypt(access_token);

  await createIntegration({
    external_id: null,
    details: {
      source: "GITHUB",
      access_token: encryptedAccessToken.token,
      iv: encryptedAccessToken.iv,
      scope,
      name: "",
      owner: "",
    },
    created_by: user.id,
    workspace_id,
  });

  redirect("/settings/integrations/github");
}
