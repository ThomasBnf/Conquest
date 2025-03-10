import { createManyActivityTypes as _createManyActivityTypes } from "@conquest/clickhouse/activity-types/createManyActivityTypes";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { ActivityTypeRuleSchema } from "@conquest/zod/schemas/activity-type.schema";
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
          conditions: z.object({
            rules: ActivityTypeRuleSchema.array(),
          }),
          deletable: z.boolean(),
        }),
      ),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { activity_types } = input;

    await _createManyActivityTypes({
      activity_types,
      workspace_id,
    });
  });
