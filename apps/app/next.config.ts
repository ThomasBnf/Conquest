import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { env } from "node:process";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["conquest.ngrok.app", "app.useconquest.com"],
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".js", ".mjs", ".json"],
  },
};

export default withSentryConfig(nextConfig, {
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,
  silent: !process.env.CI,
});
