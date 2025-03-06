import { DISCORD_PERMISSIONS, DISCORD_SCOPES } from "@/constant";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { encrypt } from "@conquest/db/utils/encrypt";
import { env } from "@conquest/env";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    error?: string;
    code: string;
  };
};

export default async function Page({ searchParams: { code, error } }: Props) {
  const { id: userId, workspace_id } = await getCurrentUser();

  if (error) redirect("/settings/integrations/discord?error=access_denied");

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
    return redirect("settings/integrations/discord?error=invalid_code");
  }

  const data = await response.json();
  const { access_token, expires_in, refresh_token, guild } = data;
  const { id, name } = guild;

  const integration = await getIntegration({
    external_id: id,
    workspace_id,
  });

  if (integration) {
    return redirect("settings/integrations/discord?error=already_connected");
  }

  const encryptedAccessToken = await encrypt(access_token);
  const encryptedRefreshToken = await encrypt(refresh_token);

  await createIntegration({
    external_id: id,
    details: {
      source: "Discord",
      name,
      access_token: encryptedAccessToken.token,
      access_token_iv: encryptedAccessToken.iv,
      refresh_token: encryptedRefreshToken.token,
      refresh_token_iv: encryptedRefreshToken.iv,
      expires_in,
      scopes: DISCORD_SCOPES,
      permissions: DISCORD_PERMISSIONS,
    },
    created_by: userId,
    workspace_id,
  });

  redirect("/settings/integrations/discord");
}
