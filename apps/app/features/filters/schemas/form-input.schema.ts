import { z } from "zod";

export const FormInputSchema = z.object({
  query: z.string().or(z.coerce.number()),
});

export type FormInput = z.infer<typeof FormInputSchema>;
