import { z } from "zod";
import { REASON } from "../enum/reason.enum";
import { STATE } from "../enum/state.enum";

export const DuplicateSchema = z.object({
  id: z.string().uuid(),
  memberIds: z.array(z.string()),
  reason: REASON,
  state: STATE,
  totalPulse: z.number(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Duplicate = z.infer<typeof DuplicateSchema>;
