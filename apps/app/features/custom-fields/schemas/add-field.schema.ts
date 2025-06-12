import { TYPE } from "@conquest/zod/enum/type.enum";
import { z } from "zod";

export const AddFieldSchema = z.object({
  type: TYPE,
  label: z.string().min(1),
});

export type AddField = z.infer<typeof AddFieldSchema>;
