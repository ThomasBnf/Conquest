import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ActivityDetailsSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const updateActivity = safeAction
  .metadata({ name: "updateActivity" })
  .schema(
    z.object({
      external_id: z.string(),
      details: ActivityDetailsSchema,
    }),
  )
  .action(async ({ parsedInput: { external_id, details } }) => {
    return await prisma.activity.update({
      where: {
        external_id,
      },
      data: {
        details,
      },
    });
  });
