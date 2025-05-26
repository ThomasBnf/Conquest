import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_svkvhdhlspmnalydmzbs",
  logLevel: "log",
  build: {
    external: ["@react-email/render", "@react-email/components"],
    extensions: [
      prismaExtension({
        schema: "../../packages/db/prisma/schema.prisma",
      }),
    ],
  },
  dirs: ["./src/tasks"],
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 1,
    },
  },
  maxDuration: 60 * 60 * 10,
});
