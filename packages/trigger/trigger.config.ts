import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_svkvhdhlspmnalydmzbs",
  logLevel: "log",
  build: {
    external: ["react", "react-dom"],
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
  maxDuration: 30 * 24 * 60 * 60,
});
