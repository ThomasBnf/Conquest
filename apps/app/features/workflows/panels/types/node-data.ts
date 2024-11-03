import type {
  Frequency,
  NodeListMembers,
  NodeManualRun,
  NodeRecurring,
  NodeTagMember,
  NodeWebhook,
  RepeatOn,
  NodeData as ZodNodeData,
} from "@conquest/zod/node.schema";
import type { Node } from "@xyflow/react";

export type WorkflowNode = Node<ZodNodeData>;

export type {
  Frequency,
  NodeListMembers,
  NodeManualRun,
  NodeRecurring,
  NodeTagMember,
  NodeWebhook,
  RepeatOn,
};

export type { NodeData } from "@conquest/zod/node.schema";
