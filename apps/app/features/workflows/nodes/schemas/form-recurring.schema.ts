import {
  FrequencySchema,
  RepeatOnSchema,
} from "@conquest/zod/schemas/node.schema";
import { z } from "zod";

export const FormRecurringSchema = z.object({
  frequency: FrequencySchema,
  repeat_on: z.array(RepeatOnSchema),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Provide a valid time in the format HH:MM",
  }),
});

export type FormRecurring = z.infer<typeof FormRecurringSchema>;
