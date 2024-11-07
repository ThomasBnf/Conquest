import { z } from "zod";

export const DiscourseAPISchema = z.object({
  apiKey: z.string().min(1),
});
export type DiscourseAPI = z.infer<typeof DiscourseAPISchema>;
