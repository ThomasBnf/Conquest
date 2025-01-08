import { z } from "zod";

export const addActivitySchema = z.object({
  message: z.string(),
  activity_type_key: z.string(),
});

export type AddActivityForm = z.infer<typeof addActivitySchema>;
