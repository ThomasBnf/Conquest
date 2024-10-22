import { z } from "zod";

export const FormCreateMemberSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
});

export type FormCreateMember = z.infer<typeof FormCreateMemberSchema>;
