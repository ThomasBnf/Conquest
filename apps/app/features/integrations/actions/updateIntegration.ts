import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { STATUS } from "@conquest/zod/integration.schema";
import { z } from "zod";

export const updateIntegration = safeAction
  .metadata({
    name: "updateIntegration",
  })
  .schema(
    z.object({
      external_id: z.string(),
      installed_at: z.date().optional(),
      status: STATUS,
    }),
  )
  .action(async ({ parsedInput: { external_id, installed_at, status } }) => {
    return await prisma.integration.update({
      where: {
        external_id,
      },
      data: {
        installed_at,
        status,
      },
      include: {
        workspace: true,
      },
    });
  });
