import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    VERCEL_URL: z
      .string()
      .optional()
      .transform((v) => (v ? `https://${v}` : undefined)),
    PORT: z.coerce.number().default(3000),
  },
  server: {
    AUTH_SECRET: z.string(),

    SLACK_TOKEN: z.string(),
    SLACK_APP_ID: z.string(),
    SLACK_CLIENT_SECRET: z.string(),
    SLACK_SIGNING_SECRET: z.string(),

    DISCOURSE_SECRET_KEY: z.string(),

    DISCORD_CLIENT_SECRET: z.string(),
    DISCORD_BOT_TOKEN: z.string(),

    LINKEDIN_CLIENT_SECRET: z.string(),

    LIVESTORM_CLIENT_SECRET: z.string(),

    STRIPE_SECRET_KEY: z.string(),

    RESEND_API_KEY: z.string(),

    GOOGLE_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string(),
    NEXT_PUBLIC_SLACK_CLIENT_ID: z.string(),
    NEXT_PUBLIC_LINKEDIN_CLIENT_ID: z.string(),
    NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string(),
    NEXT_PUBLIC_LIVESTORM_CLIENT_ID: z.string(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,

    AUTH_SECRET: process.env.AUTH_SECRET,

    SLACK_TOKEN: process.env.SLACK_TOKEN,
    SLACK_APP_ID: process.env.SLACK_APP_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
    NEXT_PUBLIC_SLACK_CLIENT_ID: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,

    DISCOURSE_SECRET_KEY: process.env.DISCOURSE_SECRET_KEY,

    NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,

    NEXT_PUBLIC_LINKEDIN_CLIENT_ID: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,

    NEXT_PUBLIC_LIVESTORM_CLIENT_ID:
      process.env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
    LIVESTORM_CLIENT_SECRET: process.env.LIVESTORM_CLIENT_SECRET,

    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

    RESEND_API_KEY: process.env.RESEND_API_KEY,

    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
