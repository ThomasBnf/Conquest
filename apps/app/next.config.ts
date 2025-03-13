import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
};

export default withSentryConfig(nextConfig, {
  org: "conquest-nk",
  project: "conquest",
  silent: !process.env.CI,
  disableLogger: true,
});
