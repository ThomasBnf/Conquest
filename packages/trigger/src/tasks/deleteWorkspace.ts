import { client } from "@conquest/clickhouse/client";
import { discordClient } from "@conquest/db/discord";
import { prisma } from "@conquest/db/prisma";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { Routes } from "discord-api-types/v10";
import { z } from "zod";

export const deleteWorkspace = schemaTask({
  id: "delete-workspace",
  machine: "small-2x",
  schema: z.object({
    workspaceId: z.string(),
  }),
  run: async ({ workspaceId }) => {
    const integrations = IntegrationSchema.array().parse(
      await prisma.integration.findMany({
        where: {
          workspaceId,
        },
      }),
    );

    for (const integration of integrations) {
      const { source } = integration.details;

      switch (source) {
        case "Discord": {
          const { externalId } = integration;

          if (!externalId) continue;

          await discordClient.delete(`${Routes.guild(externalId)}`);
        }
      }
    }

    await client.query({
      query: `
        ALTER TABLE activity
        DELETE WHERE workspaceId = '${workspaceId}'
      `,
    });

    await client.query({
      query: `
          ALTER TABLE activityType
          DELETE WHERE workspaceId = '${workspaceId}'
        `,
    });

    await client.query({
      query: `
          ALTER TABLE channel
          DELETE WHERE workspaceId = '${workspaceId}'
        `,
    });

    await client.query({
      query: `
          ALTER TABLE company
          DELETE WHERE workspaceId = '${workspaceId}'
        `,
    });

    await client.query({
      query: `
          ALTER TABLE level
          DELETE WHERE workspaceId = '${workspaceId}'
        `,
    });

    await client.query({
      query: `
          ALTER TABLE log
          DELETE WHERE workspaceId = '${workspaceId}'
        `,
    });

    await client.query({
      query: `
          ALTER TABLE member
          DELETE WHERE workspaceId = '${workspaceId}'
        `,
    });

    await client.query({
      query: `
          ALTER TABLE profile
          DELETE WHERE workspaceId = '${workspaceId}'
        `,
    });

    await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  },
});
