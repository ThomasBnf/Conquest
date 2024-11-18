import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_svkvhdhlspmnalydmzbs",
  build: {
    extensions: [
      prismaExtension({
        schema: "../../packages/database/prisma/schema.prisma",
      }),
    ],
  },
  runtime: "node",
  logLevel: "log",
  dirs: ["./trigger"],
});
