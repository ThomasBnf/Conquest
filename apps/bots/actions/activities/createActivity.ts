import { safeAction } from "@/lib/safeAction";
import {
  ActivityDetailsSchema,
  ActivitySchema,
} from "@conquest/zod/activity.schema";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const createActivity = safeAction
  .metadata({
    name: "createActivity",
  })
  .schema(
    z.object({
      details: ActivityDetailsSchema,
      channel_id: z.string().cuid(),
      contact_id: z.string().cuid(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(
    async ({
      parsedInput: { details, channel_id, contact_id, workspace_id },
    }) => {
      const activity = await prisma.activity.create({
        data: {
          details,
          channel_id,
          contact_id,
          workspace_id,
        },
      });

      return ActivitySchema.parse(activity);
    },
  );
