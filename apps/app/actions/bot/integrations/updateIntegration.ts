import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const updateIntegration = safeAction
  .metadata({
    name: "updateIntegration",
  })
  .schema(
    z.object({
      external_id: z.string(),
      status: z.enum(["CONNECTED", "DISCONNECTED"]),
    }),
  )
  .action(async ({ parsedInput: { external_id, status } }) => {
    return await prisma.integration.update({
      where: {
        external_id,
      },
      data: {
        status,
      },
    });
  });
