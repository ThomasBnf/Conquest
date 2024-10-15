import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ActivitySchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const listActivities = safeAction
  .metadata({
    name: "listActivities",
  })
  .schema(
    z.object({
      channel_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { channel_id } }) => {
    const activities = await prisma.activity.findMany({
      where: {
        channel_id,
      },
    });

    return ActivitySchema.array().parse(activities);
  });
