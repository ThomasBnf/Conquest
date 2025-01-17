import { z } from "zod";

export const FieldSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  name: z.string(),
});

export const FormDiscourseSchema = z.object({
  community_url: z.string(),
  api_key: z.string(),
  payload_url: z.boolean(),
  content_type: z.boolean(),
  secret: z.boolean(),
  send_me_everything: z.boolean(),
});

export type FormDiscourse = z.infer<typeof FormDiscourseSchema>;
export type Field = z.infer<typeof FieldSchema>;
