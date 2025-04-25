import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";

export const MemberFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  primaryEmail: z.string().email(),
  source: SOURCE,
});

export type MemberForm = z.infer<typeof MemberFormSchema>;
