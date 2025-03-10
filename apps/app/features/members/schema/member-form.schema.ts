import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const MemberFormSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  primary_email: z.string().email(),
  source: SOURCE,
});

export type MemberForm = z.infer<typeof MemberFormSchema>;
