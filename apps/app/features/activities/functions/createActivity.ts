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
      external_id: z.string().nullable(),
      details: ActivityDetailsSchema,
      channel_id: z.string(),
      member_id: z.string(),
      workspace_id: z.string(),
      created_at: z.date().optional(),
      updated_at: z.date().optional(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        external_id,
        details,
        channel_id,
        member_id,
        workspace_id,
        created_at,
        updated_at,
      },
    }) => {
      const activity = await prisma.activity.create({
        data: {
          external_id,
          details,
          channel_id,
          member_id,
          workspace_id,
          created_at,
          updated_at,
        },
      });

      return ActivitySchema.parse(activity);
    },
  );
