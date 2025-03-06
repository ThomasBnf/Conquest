import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const FormCreateSchema = z.object({
  activity_type_key: z.string(),
  message: z.string(),
  member_id: z.string(),
  source: SOURCE,
  created_at: z.date(),
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
