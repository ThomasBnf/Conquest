import { z } from "zod";

export const FormDiscourseSchema = z.object({
  community_url: z.string(),
  api_key: z.string(),
});

export type FormDiscourse = z.infer<typeof FormDiscourseSchema>;
