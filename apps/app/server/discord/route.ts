import { discordClient } from "@/lib/discord";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { type APIGuildCategoryChannel, Routes } from "discord-api-types/v10";
import { Hono } from "hono";

export const discord = new Hono().get("/channels", async (c) => {
  const user = await getAuthUser(c);

  const { workspace_id } = user;

  const discord = DiscordIntegrationSchema.parse(
    await prisma.integrations.findFirst({
      where: {
        workspace_id,
        details: {
          path: ["source"],
          equals: "DISCORD",
        },
      },
    }),
  );

  const { external_id, details } = discord;
  const { access_token } = details;

  if (!access_token || !external_id) return c.json([]);

  const channels = (await discordClient.get(
    Routes.guildChannels(external_id),
  )) as APIGuildCategoryChannel[];

  return c.json(channels.filter((channel) => channel));
});
