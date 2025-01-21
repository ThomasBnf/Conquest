import { z } from "zod";

export const FormFilterSchema = z.object({
  filter: z.string().optional(),
});

export type FormFilter = z.infer<typeof FormFilterSchema>;
