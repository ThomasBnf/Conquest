import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { ActivityTypeConditionSchema } from "@conquest/zod/schemas/activity-type.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const createManyActivityTypes = protectedProcedure
  .input(
    z.object({
      activity_types: z.array(
        z.object({
          name: z.string(),
          source: SOURCE,
          key: z.string(),
          points: z.number(),
          conditions: z.array(ActivityTypeConditionSchema),
          deletable: z.boolean().optional(),
        }),
      ),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { activity_types } = input;

    for (const activity_type of activity_types) {
      await prisma.activity_type.create({
        data: {
          ...activity_type,
          workspace_id,
        },
      });
    }
  });
