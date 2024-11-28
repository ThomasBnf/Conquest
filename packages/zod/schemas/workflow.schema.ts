import type { workflows as WorkflowPrisma } from "@prisma/client";
import { z } from "zod";
import { EdgeSchema } from "./edge.schema";
import { NodeSchema } from "./node.schema";

export const WorkflowSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string().nullable(),
  published: z.boolean(),
  last_run_at: z.date().nullable(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<WorkflowPrisma>;

export type Workflow = z.infer<typeof WorkflowSchema>;
