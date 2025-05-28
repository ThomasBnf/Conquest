import { DISCORD_PERMISSIONS, DISCORD_SCOPES } from "@/constant";
import { getCurrentUser } from "@/queries/getCurrentUser";
import { createIntegration } from "@conquest/db/integrations/createIntegration";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { prisma } from "@conquest/db/prisma";
import { encrypt } from "@conquest/db/utils/encrypt";
import { env } from "@conquest/env";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    error?: string;
    code: string;
    permissions: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { code, error, permissions } = await searchParams;
  const { id: userId, workspaceId } = await getCurrentUser();

  if (permissions !== DISCORD_PERMISSIONS) {
    redirect("/settings/integrations/discord?error=missing_permissions");
  }

  if (error) {
    redirect("/settings/integrations/discord?error=access_denied");
  }

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      response_type: "code",
      code,
      grant_type: "authorization_code",
      client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      redirect_uri: `${env.NEXT_PUBLIC_URL}/connect/discord`,
      scope: DISCORD_SCOPES,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    redirect("/settings/integrations/discord?error=invalid_code");
  }

  const { access_token, expires_in, refresh_token, guild } = data;
  const { id, name } = guild;

  const existingIntegration = await prisma.integration.findUnique({
    where: {
      externalId: id,
      NOT: {
        workspaceId,
      },
    },
  });

  if (existingIntegration) {
    redirect("/settings/integrations/discord?error=already_connected");
  }

  const integration = await getIntegration({ externalId: id, workspaceId });

  if (!integration) {
    const encryptedAccessToken = await encrypt(access_token);
    const encryptedRefreshToken = await encrypt(refresh_token);

    await createIntegration({
      externalId: id,
      details: {
        source: "Discord",
        name,
        accessToken: encryptedAccessToken.token,
        accessTokenIv: encryptedAccessToken.iv,
        refreshToken: encryptedRefreshToken.token,
        refreshTokenIv: encryptedRefreshToken.iv,
        expiresIn: expires_in,
        scopes: DISCORD_SCOPES,
        permissions: DISCORD_PERMISSIONS,
      },
      createdBy: userId,
      workspaceId,
    });

    redirect("/settings/integrations/discord");
  }

  const discord = DiscordIntegrationSchema.parse(integration);

  await updateIntegration({
    id: discord.id,
    workspaceId,
    details: {
      ...discord.details,
      permissions: DISCORD_PERMISSIONS,
    },
  });

  redirect("/settings/integrations/discord?message=updated");
}
