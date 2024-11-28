import { safeAction } from "@/lib/safeAction";
import { ActivitySchema } from "@conquest/zod/activity.schema";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const createActivity = safeAction
  .metadata({
    name: "createActivity",
  })
  .schema(
    z.object({
      external_id: z.string().nullable(),
      activity_type_id: z.string().cuid(),
      message: z.string(),
      react_to: z.string().nullable().optional(),
      reply_to: z.string().nullable().optional(),
      invite_by: z.string().nullable().optional(),
      channel_id: z.string().nullable(),
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
        activity_type_id,
        message,
        react_to,
        reply_to,
        invite_by,
        channel_id,
        member_id,
        workspace_id,
        created_at,
        updated_at,
      },
    }) => {
      const activity = await prisma.activities.create({
        data: {
          external_id,
          activity_type_id,
          message,
          react_to,
          reply_to,
          invite_by,
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
