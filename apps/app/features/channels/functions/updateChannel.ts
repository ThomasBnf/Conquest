import { safeAction } from "@/lib/safeAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const updateChannel = safeAction
  .metadata({ name: "updateChannel" })
  .schema(
    z.object({
      external_id: z.string(),
      name: z.string(),
    }),
  )
  .action(async ({ parsedInput: { external_id, name } }) => {
    return await prisma.channels.update({
      where: {
        external_id,
      },
      data: {
        name,
      },
    });
  });
