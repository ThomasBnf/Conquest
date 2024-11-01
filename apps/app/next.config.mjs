import "./env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "files.slack.com" }],
  },
};

export default nextConfig;
