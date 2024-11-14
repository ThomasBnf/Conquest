import { z } from "zod";

export const DiscourseAPISchema = z.object({
  api_key: z.string().min(1),
  community_url: z.string().min(1),
});
export type DiscourseAPI = z.infer<typeof DiscourseAPISchema>;
