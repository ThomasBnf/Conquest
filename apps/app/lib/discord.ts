import { env } from "@/env.mjs";
import { REST } from "@discordjs/rest";

export const discordClient = new REST({ version: "10" }).setToken(
  env.DISCORD_BOT_TOKEN,
);
