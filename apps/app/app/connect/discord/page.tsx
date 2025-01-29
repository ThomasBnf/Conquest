import { DISCORD_PERMISSIONS, DISCORD_SCOPES } from "@/constant";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/queries/integrations/createIntegration";
import { getIntegration } from "@conquest/db/queries/integrations/getIntegration";
import { env } from "@conquest/env";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    code: string;
  };
};

export default async function Page({ searchParams: { code } }: Props) {
  const user = await getCurrentUser();
  const { slug, id: workspace_id } = user.workspace;

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      response_type: "code",
      code,
      grant_type: "authorization_code",
      client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/connect/discord`,
    }),
  });

  if (!response.ok) {
    return redirect(
      `/${slug}/settings/integrations/discord?error=invalid_code`,
    );
  }

  const data = await response.json();
  const { access_token, expires_in, refresh_token, guild } = data;
  const { id, name } = guild;

  const integration = await getIntegration({
    external_id: id,
  });

  if (integration) {
    return redirect(
      `/${slug}/settings/integrations/discord?error=already_connected`,
    );
  }

  await createIntegration({
    external_id: id,
    details: {
      source: "DISCORD",
      name,
      access_token,
      expires_in,
      refresh_token,
      scopes: DISCORD_SCOPES,
      permissions: DISCORD_PERMISSIONS,
    },
    created_by: user.id,
    workspace_id,
  });

  redirect(`/${slug}/settings/integrations/discord`);
}
