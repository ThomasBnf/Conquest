import { client } from "@conquest/clickhouse/client";
import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const deleteWorkspace = protectedProcedure.mutation(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    await Promise.all([
      client.query({
        query: `
      ALTER TABLE activity DELETE 
      WHERE workspace_id = '${workspace_id}'`,
      }),

      client.query({
        query: `
      ALTER TABLE activity_type DELETE 
      WHERE workspace_id = '${workspace_id}'`,
      }),

      client.query({
        query: `
      ALTER TABLE channel DELETE
      WHERE workspace_id = '${workspace_id}'`,
      }),

      client.query({
        query: `
      ALTER TABLE company DELETE
      WHERE workspace_id = '${workspace_id}'`,
      }),

      client.query({
        query: `
      ALTER TABLE level DELETE
      WHERE workspace_id = '${workspace_id}'`,
      }),

      client.query({
        query: `
      ALTER TABLE log DELETE 
      WHERE workspace_id = '${workspace_id}'`,
      }),

      client.query({
        query: `
      ALTER TABLE member DELETE
      WHERE workspace_id = '${workspace_id}'`,
      }),

      client.query({
        query: `
      ALTER TABLE profile DELETE
      WHERE workspace_id = '${workspace_id}'`,
      }),
    ]);

    await prisma.workspace.delete({
      where: { id: workspace_id },
    });

    return { success: true };
  },
);
