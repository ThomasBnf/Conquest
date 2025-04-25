import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const TagSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string().nullable(),
  name: z.string(),
  color: z.string(),
  source: SOURCE,
  workspaceId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Tag = z.infer<typeof TagSchema>;
