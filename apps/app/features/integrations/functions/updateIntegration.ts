import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { STATUS } from "@conquest/zod/status.enum";
import { z } from "zod";

export const updateIntegration = safeAction
  .metadata({
    name: "updateIntegration",
  })
  .schema(
    z.object({
      external_id: z.string().nullable(),
      installed_at: z.date().nullable(),
      status: STATUS,
    }),
  )
  .action(async ({ parsedInput: { external_id, installed_at, status } }) => {
    return await prisma.integration.updateMany({
      where: {
        external_id,
      },
      data: {
        installed_at,
        status,
      },
    });
  });
