import type { icons } from "lucide-react";
import { z } from "zod";
import { EdgeSchema } from "./edge.schema";
import { NodeSchema } from "./node.schema";

export const WorkflowSchema = z.object({
  id: z.string().cuid(),
  icon: z.custom<keyof typeof icons>(),
  name: z.string(),
  description: z.string().nullable(),
  isPublished: z.boolean().default(false),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
