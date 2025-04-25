import { client } from "@conquest/clickhouse/client";
import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const deleteWorkspace = protectedProcedure.mutation(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    await Promise.all([
      client.query({
        query: `
      ALTER TABLE activity DELETE 
      WHERE workspaceId = '${workspaceId}'`,
      }),

      client.query({
        query: `
      ALTER TABLE activityType DELETE 
      WHERE workspaceId = '${workspaceId}'`,
      }),

      client.query({
        query: `
      ALTER TABLE channel DELETE
      WHERE workspaceId = '${workspaceId}'`,
      }),

      client.query({
        query: `
      ALTER TABLE company DELETE
      WHERE workspaceId = '${workspaceId}'`,
      }),

      client.query({
        query: `
      ALTER TABLE level DELETE
      WHERE workspaceId = '${workspaceId}'`,
      }),

      client.query({
        query: `
      ALTER TABLE log DELETE 
      WHERE workspaceId = '${workspaceId}'`,
      }),

      client.query({
        query: `
      ALTER TABLE member DELETE
      WHERE workspaceId = '${workspaceId}'`,
      }),

      client.query({
        query: `
      ALTER TABLE profile DELETE
      WHERE workspaceId = '${workspaceId}'`,
      }),
    ]);

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { success: true };
  },
);
