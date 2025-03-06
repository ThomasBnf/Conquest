import { SOURCE } from "@conquest/zod/enum/source.enum";
import { ActivityTypeRuleSchema } from "@conquest/zod/schemas/activity-type.schema";
import { z } from "zod";

export const FormActivityTypeSchema = z.object({
  source: SOURCE,
  name: z.string().min(1),
  key: z.string().min(1),
  points: z.coerce.number().int().min(0),
  conditions: z.object({
    rules: ActivityTypeRuleSchema.array(),
  }),
  deletable: z.boolean().optional(),
});

export type FormActivityType = z.infer<typeof FormActivityTypeSchema>;
