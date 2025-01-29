import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const FormCreateSchema = z.object({
  source: SOURCE,
  name: z.string().min(1),
  key: z.string().min(1),
  weight: z.coerce.number().min(0).max(12),
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
