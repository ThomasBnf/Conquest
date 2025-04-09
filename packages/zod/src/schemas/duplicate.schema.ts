import { z } from "zod";
import { REASON } from "../enum/reason.enum";
import { STATE } from "../enum/state.enum";

export const DuplicateSchema = z.object({
  id: z.string().uuid(),
  member_ids: z.array(z.string()),
  reason: REASON,
  state: STATE,
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Duplicate = z.infer<typeof DuplicateSchema>;
