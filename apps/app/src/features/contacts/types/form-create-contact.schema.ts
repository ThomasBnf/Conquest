import { z } from "zod";

export const FormCreateContactSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
});

export type FormCreateContact = z.infer<typeof FormCreateContactSchema>;
