import { env } from "@conquest/env";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
};

export default withSentryConfig(nextConfig, {
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,
  silent: !process.env.CI,
  disableLogger: true,
});
