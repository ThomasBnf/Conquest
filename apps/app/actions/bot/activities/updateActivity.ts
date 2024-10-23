import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import {
  ActivityDetailsSchema,
  ActivitySchema,
} from "@conquest/zod/activity.schema";
import { z } from "zod";

export const updateActivity = safeAction
  .metadata({ name: "updateActivity" })
  .schema(
    z.object({
      ts: z.string(),
      details: ActivityDetailsSchema,
    }),
  )
  .action(async ({ parsedInput: { ts, details } }) => {
    const activity = await prisma.activity.updateMany({
      where: {
        details: {
          path: ["ts"],
          equals: ts,
        },
      },
      data: {
        details,
      },
    });

    return ActivitySchema.parse(activity);
  });
