import { z } from "zod";

export const FormValueSchema = z.object({
  value: z.coerce.number().default(1),
});

export type FormValue = z.infer<typeof FormValueSchema>;
