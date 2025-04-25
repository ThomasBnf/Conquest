import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const FormCreateSchema = z.object({
  activityTypeKey: z.string(),
  message: z.string(),
  memberId: z.string(),
  source: SOURCE,
});

export type FormCreate = z.infer<typeof FormCreateSchema>;
