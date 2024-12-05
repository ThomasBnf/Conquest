import type { tags as TagPrisma } from "@prisma/client";
import { z } from "zod";
import { SOURCE } from "./enum/source.enum";

export const TagSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string(),
  source: SOURCE,
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<TagPrisma>;

export type Tag = z.infer<typeof TagSchema>;
