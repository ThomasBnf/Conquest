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
      channel_id: z.string(),
      member_id: z.string(),
      workspace_id: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: { details, channel_id, member_id, workspace_id },
    }) => {
      const activity = await prisma.activity.create({
        data: {
          details,
          channel_id,
          member_id,
          workspace_id,
        },
      });

      return ActivitySchema.parse(activity);
    },
  );
