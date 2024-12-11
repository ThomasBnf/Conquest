import { z } from "zod";

export const addActivitySchema = z.object({
  message: z.string(),
  activity_type_id: z.string().cuid(),
});

export type AddActivityForm = z.infer<typeof addActivitySchema>;
