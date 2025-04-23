import { z } from "zod";

export const TeamFormSchema = z.object({
  emails: z.string().min(1, { message: "Emails are required" }),
});

export type TeamForm = z.infer<typeof TeamFormSchema>;
