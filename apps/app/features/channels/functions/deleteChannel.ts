import { safeAction } from "@/lib/safeAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const deleteChannel = safeAction
  .metadata({
    name: "deleteChannel",
  })
  .schema(
    z.object({
      external_id: z.string(),
    }),
  )
  .action(async ({ parsedInput: { external_id } }) => {
    return await prisma.channels.delete({
      where: {
        external_id,
      },
    });
  });
