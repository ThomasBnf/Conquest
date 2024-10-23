import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ActivityDetailsSchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const updateActivity = safeAction
  .metadata({ name: "updateActivity" })
  .schema(
    z.object({
      ts: z.string(),
      previous_text: z.string(),
      details: ActivityDetailsSchema,
    }),
  )
  .action(async ({ parsedInput: { ts, previous_text, details } }) => {
    return await prisma.activity.updateMany({
      where: {
        details: {
          path: ["ts"],
          equals: ts,
        },
        AND: {
          details: {
            path: ["message"],
            equals: previous_text,
          },
        },
      },
      data: {
        details,
      },
    });
  });
