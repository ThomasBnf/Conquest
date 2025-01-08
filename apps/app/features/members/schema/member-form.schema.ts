import { z } from "zod";

export const MemberFormSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
});

export type MemberForm = z.infer<typeof MemberFormSchema>;
