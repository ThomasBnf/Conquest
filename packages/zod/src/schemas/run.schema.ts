import { z } from "zod";
import { NodeSchema } from "./node.schema";

export const RUN_STATUS = z.enum(["RUNNING", "WAITING", "COMPLETED", "FAILED"]);

export const RunSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid().nullable(),
  workflowId: z.string(),
  completedAt: z.date().nullable(),
  failedAt: z.date().nullable(),
  status: RUN_STATUS,
  runNodes: z.array(NodeSchema),
  credits: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Run = z.infer<typeof RunSchema>;
export type RunStatus = z.infer<typeof RUN_STATUS>;
