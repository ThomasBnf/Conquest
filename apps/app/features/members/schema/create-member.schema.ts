import { z } from "zod";

export const CreateMemberSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
});

export type CreateMember = z.infer<typeof CreateMemberSchema>;
