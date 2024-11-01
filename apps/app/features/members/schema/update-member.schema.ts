import { z } from "zod";

export const updateMemberSchema = z.object({
  id: z.string(),
  emails: z.array(z.string()).optional(),
  phones: z.array(z.string()).optional(),
  job_title: z.string().optional(),
  address: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateMember = z.infer<typeof updateMemberSchema>;
