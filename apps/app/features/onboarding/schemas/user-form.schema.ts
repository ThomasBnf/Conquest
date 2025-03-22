import { z } from "zod";

export const UserFormSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});

export type UserForm = z.infer<typeof UserFormSchema>;
