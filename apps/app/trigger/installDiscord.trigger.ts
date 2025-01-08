import { discordClient } from "@/lib/discord";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { type APIGuildCategoryChannel, Routes } from "discord-api-types/v10";
import { z } from "zod";

export const installDiscord = schemaTask({
  id: "install-discord",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    discord: DiscordIntegrationSchema,
    channels: z.array(z.custom<APIGuildCategoryChannel>()),
  }),
  retry: {
    maxAttempts: 1,
  },
  run: async ({ discord, channels }) => {
    const { workspace_id, external_id, details } = discord;
    const { access_token, refresh_token } = details;

    if (!external_id) return;

    await updateIntegration({
      id: discord.id,
      status: "SYNCING",
    });

    const members = await discordClient.get(Routes.guildMembers(external_id));
    console.log(members);
  },
  onSuccess: async ({ discord }) => {
    await updateIntegration({
      id: discord.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ discord }) => {
    await deleteIntegration({
      source: "DISCORD",
      integration: discord,
    });
  },
});
