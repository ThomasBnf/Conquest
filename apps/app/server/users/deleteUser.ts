import { listUsers } from "@/queries/listUsers";
import { client } from "@conquest/clickhouse/client";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { listIntegrations } from "@conquest/db/integrations/listIntegrations";
import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const deleteUser = protectedProcedure.mutation(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const users = await listUsers({ workspace_id });

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    if (users === 1) {
      const integrations = await listIntegrations({ workspace_id });

      for (const integration of integrations) {
        await deleteIntegration({ integration });
      }

      await client.query({
        query: `
        ALTER TABLE channel
        DELETE
        WHERE workspace_id = '${workspace_id}'`,
      });

      await client.query({
        query: `
        ALTER TABLE level
        DELETE
        WHERE workspace_id = '${workspace_id}'`,
      });

      await client.query({
        query: `
        ALTER TABLE log
        DELETE
        WHERE workspace_id = '${workspace_id}'`,
      });

      await prisma.workspace.delete({
        where: {
          id: workspace_id,
        },
      });
    }

    return { success: true };
  },
);
