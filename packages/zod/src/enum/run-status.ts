import { z } from "zod";

export const WORKFLOW_STATUS = z.enum(["RUNNING", "COMPLETED", "FAILED"]);

export type WorkflowStatus = z.infer<typeof WORKFLOW_STATUS>;
