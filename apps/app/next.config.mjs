import "./env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["files.slack.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.slack.com",
        pathname: "/files-pri/**",
      },
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn", "info"],
          }
        : false,
  },
};

export default nextConfig;
