import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    VERCEL_URL: z
      .string()
      .optional()
      .transform((v) => (v ? `https://${v}` : undefined)),
    PORT: z.coerce.number().default(3004),
  },
  server: {
    DISCORD_BOT_TOKEN: z.string(),
  },
  client: {},
  runtimeEnv: {
    PORT: process.env.PORT,
    VERCEL_URL: process.env.VERCEL_URL,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
