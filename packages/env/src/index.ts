import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const baseEnv = {
  server: {
    AUTH_SECRET: z.string(),
    DATABASE_URL: z.string(),
    DIRECT_URL: z.string(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  },
};

const clickhouseEnv = {
  server: {
    CLICKHOUSE_URL: z.string(),
    CLICKHOUSE_USER: z.string(),
    CLICKHOUSE_PASSWORD: z.string(),
  },
};

const discordEnv = {
  server: {
    DISCORD_CLIENT_SECRET: z.string(),
    DISCORD_BOT_TOKEN: z.string(),
  },
  client: {
    NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
  },
};

const discourseEnv = {
  server: {
    DISCOURSE_SECRET_KEY: z.string(),
  },
};

const encryptionEnv = {
  server: {
    ENCRYPTION_SECRET: z.string(),
  },
};

const githubEnv = {
  server: {
    GITHUB_CLIENT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  },
};

const googleEnv = {
  server: {
    GOOGLE_API_KEY: z.string(),
  },
};

const linkedinEnv = {
  server: {
    LINKEDIN_CLIENT_SECRET: z.string(),
    LINKEDIN_APP_ID: z.string(),
  },
  client: {
    NEXT_PUBLIC_LINKEDIN_CLIENT_ID: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_LINKEDIN_CLIENT_ID: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
  },
};

const livestormEnv = {
  server: {
    LIVESTORM_CLIENT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_LIVESTORM_CLIENT_ID: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_LIVESTORM_CLIENT_ID:
      process.env.NEXT_PUBLIC_LIVESTORM_CLIENT_ID,
  },
};

const resendEnv = {
  server: {
    RESEND_API_KEY: z.string(),
  },
};

const slackEnv = {
  server: {
    SLACK_APP_ID: z.string(),
    SLACK_CLIENT_SECRET: z.string(),
    SLACK_VERIFICATION_TOKEN: z.string(),
    SLACK_SIGNING_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_SLACK_CLIENT_ID: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SLACK_CLIENT_ID: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,
  },
};

const stripeEnv = {
  server: {
    STRIPE_SECRET_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
};

const triggerEnv = {
  server: {
    TRIGGER_SECRET_KEY: z.string(),
    TRIGGER_ACCESS_TOKEN: z.string(),
  },
};

export const env = createEnv({
  server: {
    ...baseEnv.server,
    ...clickhouseEnv.server,
    ...discordEnv.server,
    ...discourseEnv.server,
    ...encryptionEnv.server,
    ...githubEnv.server,
    ...googleEnv.server,
    ...linkedinEnv.server,
    ...livestormEnv.server,
    ...resendEnv.server,
    ...slackEnv.server,
    ...stripeEnv.server,
    ...triggerEnv.server,
  },
  client: {
    ...baseEnv.client,
    ...discordEnv.client,
    ...githubEnv.client,
    ...linkedinEnv.client,
    ...livestormEnv.client,
    ...slackEnv.client,
    ...stripeEnv.client,
  },
  experimental__runtimeEnv: {
    ...baseEnv.runtimeEnv,
    ...discordEnv.runtimeEnv,
    ...githubEnv.runtimeEnv,
    ...linkedinEnv.runtimeEnv,
    ...livestormEnv.runtimeEnv,
    ...slackEnv.runtimeEnv,
    ...stripeEnv.runtimeEnv,
  },
});
