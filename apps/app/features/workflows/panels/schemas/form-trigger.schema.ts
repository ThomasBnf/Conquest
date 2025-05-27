import { z } from "zod";

export const FormTriggerSchema = z.object({
  alertByEmail: z.boolean(),
});

export type FormTrigger = z.infer<typeof FormTriggerSchema>;
