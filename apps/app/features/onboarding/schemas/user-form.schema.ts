import { z } from "zod";

export const UserFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type UserForm = z.infer<typeof UserFormSchema>;
