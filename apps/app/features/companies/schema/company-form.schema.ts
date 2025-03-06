import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const FormCreateSchema = z.object({
  name: z.string().min(1),
  source: SOURCE,
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
