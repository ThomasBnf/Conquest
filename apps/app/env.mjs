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
    SLACK_TOKEN: z.string(),
    SLACK_APP_ID: z.string(),
    SLACK_CLIENT_SECRET: z.string(),
    SLACK_SIGNING_SECRET: z.string(),

    GOOGLE_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_SLACK_REDIRECT_URI: z.string(),
    NEXT_PUBLIC_SLACK_CLIENT_ID: z.string(),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    VERCEL_URL: process.env.VERCEL_URL,

    SLACK_TOKEN: process.env.SLACK_TOKEN,
    SLACK_APP_ID: process.env.SLACK_APP_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,

    NEXT_PUBLIC_SLACK_REDIRECT_URI: process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI,
    NEXT_PUBLIC_SLACK_CLIENT_ID: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,

    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
