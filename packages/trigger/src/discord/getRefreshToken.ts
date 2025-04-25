import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { env } from "@conquest/env";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";

type Props = {
  discord: DiscordIntegration;
};

export const getRefreshToken = async ({ discord }: Props) => {
  const { id, details, workspaceId } = discord;
  const { refreshToken } = details;

  const params = new URLSearchParams({
    client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();

  logger.info("data", { data });

  await updateIntegration({
    id,
    details: {
      ...details,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    },
    workspaceId,
  });

  return data.access_token;
};
