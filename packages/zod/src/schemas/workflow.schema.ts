import { z } from "zod";
import { EdgeSchema } from "./edge.schema";
import { NodeSchema } from "./node.schema";

export const TriggerSchema = z.enum(["member-created"]);

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  published: z.boolean(),
  lastRunAt: z.coerce.date(),
  trigger: TriggerSchema.nullable(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
export type Trigger = z.infer<typeof TriggerSchema>;
