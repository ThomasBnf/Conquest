import { prisma } from "@conquest/db/prisma";
import { STATUS } from "@conquest/zod/enum/status.enum";
import { IntegrationDetailsSchema } from "@conquest/zod/schemas/integration.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateIntegration = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      external_id: z.string().optional(),
      connected_at: z.date().optional(),
      details: IntegrationDetailsSchema.optional(),
      status: STATUS.optional(),
      created_by: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, external_id, connected_at, details, status, created_by } =
      input;

    return await prisma.integration.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        external_id,
        connected_at,
        details,
        status,
        created_by,
      },
    });
  });
