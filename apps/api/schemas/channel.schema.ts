import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const V1CreateChannelSchema = z.object({
  external_id: z.string().nullable().optional(),
  name: z.string(),
  slug: z.string().nullable().optional(),
  source: SOURCE,
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const V1UpdateChannelSchema = z.object({
  external_id: z.string().nullable().optional(),
  name: z.string().optional(),
  slug: z.string().nullable().optional(),
  source: SOURCE.optional(),
});
