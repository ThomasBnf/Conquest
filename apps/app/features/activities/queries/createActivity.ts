import {
  ActivityDetailsSchema,
  ActivitySchema,
} from "@conquest/zod/activity.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const createActivity = authAction
  .metadata({
    name: "createActivity",
  })
  .schema(
    z.object({
      external_id: z.string().optional(),
      details: ActivityDetailsSchema,
      channel_id: z.string().cuid(),
      member_id: z.string().cuid(),
      created_at: z.date().optional(),
      updated_at: z.date().optional(),
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: {
        external_id,
        details,
        channel_id,
        member_id,
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
          created_at: created_at ?? new Date(),
          updated_at: updated_at ?? new Date(),
          workspace_id: ctx.user.workspace_id,
        },
      });

      return ActivitySchema.parse(activity);
    },
  );
