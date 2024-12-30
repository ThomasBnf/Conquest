import { LINKEDIN_SCOPES } from "@/constant";
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

  const data = await response.json();
  const { access_token } = data;

  await createIntegration({
    external_id: null,
    details: {
      source: "LINKEDIN",
      access_token,
      expire_in: 3600,
      scopes: LINKEDIN_SCOPES,
      organization_id: "",
      organization_name: "",
    },
    workspace_id,
  });

  redirect(`/${slug}/settings/integrations/linkedin`);
}
