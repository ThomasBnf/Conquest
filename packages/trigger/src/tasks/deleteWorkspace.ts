import { client } from "@conquest/clickhouse/client";
import { prisma } from "@conquest/db/prisma";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { generateJWT } from "../github/generateJWT";
import { deleteIntegration } from "./deleteIntegration";

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
      let jwt = null;

      if (integration.details.source === "Github") {
        jwt = generateJWT();
      }

      await deleteIntegration.trigger({ integration, jwt });
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
