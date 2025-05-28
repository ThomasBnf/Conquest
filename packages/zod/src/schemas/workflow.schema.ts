import { z } from "zod";
import { EdgeSchema } from "./edge.schema";
import { NodeSchema } from "./node.schema";
import { RunSchema } from "./run.schema";

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  published: z.boolean(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  createdBy: z.string(),
  alertOnSuccess: z.boolean(),
  alertOnFailure: z.boolean(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  archivedAt: z.coerce.date().nullable(),
});

export const WorkflowItemSchema = WorkflowSchema.extend({
  _count: z.object({
    runs: z.number(),
  }),
  runs: z.array(RunSchema),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowItem = z.infer<typeof WorkflowItemSchema>;
