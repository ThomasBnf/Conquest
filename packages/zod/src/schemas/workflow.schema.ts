import { z } from "zod";
import { EdgeSchema } from "./edge.schema";
import { NodeSchema } from "./node.schema";

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  published: z.boolean(),
  last_run_at: z.coerce.date(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
