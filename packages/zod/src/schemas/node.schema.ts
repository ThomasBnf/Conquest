import { z } from "zod";
import { GroupFiltersSchema } from "./filters.schema";

export const TriggerSchema = z.enum([
  "member-created",
  "level-up",
  "at-risk-member",
  "potential-ambassador",
]);

// NODES

export const NodeBaseSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("custom"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const NodeBaseDataSchema = z.object({
  icon: z.string(),
  label: z.string(),
  description: z.string(),
});

// TRIGGERS

export const NodeMemberCreatedSchema = NodeBaseDataSchema.extend({
  type: z.literal("member-created"),
  isTrigger: z.boolean().default(true),
});

export const NodeLevelUpSchema = NodeBaseDataSchema.extend({
  type: z.literal("level-up"),
  isTrigger: z.boolean().default(true),
});

export const NodeAtRiskSchema = NodeBaseDataSchema.extend({
  type: z.literal("at-risk-member"),
  isTrigger: z.boolean().default(true),
});

export const NodeAmbassadorSchema = NodeBaseDataSchema.extend({
  type: z.literal("potential-ambassador"),
  isTrigger: z.boolean().default(true),
});

// ACTIONS

export const NodeIfElseSchema = NodeBaseDataSchema.extend({
  type: z.literal("if-else"),
  groupFilter: GroupFiltersSchema,
});

export const NodeSlackMessageSchema = NodeBaseDataSchema.extend({
  type: z.literal("slack-message"),
  message: z.string(),
});

export const NodeTaskSchema = NodeBaseDataSchema.extend({
  type: z.literal("task"),
  title: z.string(),
  days: z.number(),
  assignee: z.string(),
});

export const NodeTagMemberSchema = NodeBaseDataSchema.extend({
  type: z.enum(["add-tag", "remove-tag"]),
  tags: z.array(z.string()),
});

export const NodeWaitSchema = NodeBaseDataSchema.extend({
  type: z.literal("wait"),
  duration: z.coerce.number(),
  unit: z.enum(["seconds", "minutes", "hours", "days"]),
});

export const NodeWebhookSchema = NodeBaseDataSchema.extend({
  type: z.literal("webhook"),
  url: z.string().url().optional(),
  body: z.string().optional(),
});

export const NodeDataSchema = z.discriminatedUnion("type", [
  NodeMemberCreatedSchema,
  NodeLevelUpSchema,
  NodeAtRiskSchema,
  NodeAmbassadorSchema,
  NodeIfElseSchema,
  NodeSlackMessageSchema,
  NodeTagMemberSchema,
  NodeTaskSchema,
  NodeWaitSchema,
  NodeWebhookSchema,
]);

export const NodeSchema = NodeBaseSchema.extend({
  data: NodeDataSchema,
});

export type Node = z.infer<typeof NodeSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;

export type NodeMemberCreated = z.infer<typeof NodeMemberCreatedSchema>;
export type NodeLevelUp = z.infer<typeof NodeLevelUpSchema>;
export type NodeAtRisk = z.infer<typeof NodeAtRiskSchema>;
export type NodeAmbassador = z.infer<typeof NodeAmbassadorSchema>;
export type Trigger = z.infer<typeof TriggerSchema>;

export type NodeIfElse = z.infer<typeof NodeIfElseSchema>;
export type NodeSlackMessage = z.infer<typeof NodeSlackMessageSchema>;
export type NodeTagMember = z.infer<typeof NodeTagMemberSchema>;
export type NodeTask = z.infer<typeof NodeTaskSchema>;
export type NodeWait = z.infer<typeof NodeWaitSchema>;
export type NodeWebhook = z.infer<typeof NodeWebhookSchema>;
