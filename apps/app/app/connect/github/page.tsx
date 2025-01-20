import { env } from "@/env.mjs";
import { createIntegration } from "@/queries/integrations/createIntegration";
import { getCurrentUser } from "@/queries/users/getCurrentUser";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    code: string;
  };
};

export default async function Page({ searchParams: { code } }: Props) {
  const user = await getCurrentUser();
  const { slug, id: workspace_id } = user.workspace;

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
  const { access_token, scope } = data;

  await createIntegration({
    external_id: null,
    details: {
      source: "GITHUB",
      access_token,
      scope,
    },
    created_by: user.id,
    workspace_id,
  });

  redirect(`/${slug}/settings/integrations/github`);
}
