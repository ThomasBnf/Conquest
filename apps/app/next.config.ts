import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
};

export default nextConfig;

// export default withSentryConfig(nextConfig, {
//   org: env.SENTRY_ORG,
//   project: env.SENTRY_PROJECT,
//   silent: !process.env.CI,
// });
