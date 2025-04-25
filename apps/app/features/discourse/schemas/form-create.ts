import { z } from "zod";

export const FieldSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  name: z.string(),
});

export const FormCreateSchema = z.object({
  communityUrl: z.string(),
  apiKey: z.string(),
  payloadUrl: z.boolean(),
  contentType: z.boolean(),
  secret: z.boolean(),
  sendMeEverything: z.boolean(),
  active: z.boolean(),
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
export type Field = z.infer<typeof FieldSchema>;
