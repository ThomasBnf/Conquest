import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_svkvhdhlspmnalydmzbs",
  logLevel: "log",
  build: {
    extensions: [
      prismaExtension({
        schema: "../../packages/database/prisma/schema.prisma",
      }),
    ],
  },
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 1,
    },
  },
  maxDuration: 1000 * 60 * 60 * 24,
});
