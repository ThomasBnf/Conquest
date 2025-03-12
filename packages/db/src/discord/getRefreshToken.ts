import { env } from "@conquest/env";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { updateIntegration } from "../integrations/updateIntegration";

type Props = {
  discord: DiscordIntegration;
};

export const getRefreshToken = async ({ discord }: Props) => {
  const { id, details, workspace_id } = discord;
  const { refresh_token } = details;

  const params = new URLSearchParams({
    client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();

  await updateIntegration({
    id,
    details: {
      ...details,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    },
    workspace_id,
  });

  return data.access_token;
};
