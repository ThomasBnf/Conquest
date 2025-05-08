import { z } from "zod";

export const FrequencySchema = z.enum(["daily", "weekly"]);
export const RepeatOnSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
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

export const NodeLevelReachedSchema = NodeBaseDataSchema.extend({
  type: z.literal("level-reached"),
  isTrigger: z.boolean().default(true),
});

export const NodeLevelDecreasedSchema = NodeBaseDataSchema.extend({
  type: z.literal("level-decreased"),
  isTrigger: z.boolean().default(true),
});

// ACTIONS

export const NodeTagMemberSchema = NodeBaseDataSchema.extend({
  type: z.enum(["add-tag", "remove-tag"]),
  tags: z.array(z.string()),
});

export const NodeSlackMessageSchema = NodeBaseDataSchema.extend({
  type: z.literal("slack-message"),
  message: z.string(),
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
  NodeLevelReachedSchema,
  NodeLevelDecreasedSchema,
  NodeTagMemberSchema,
  NodeSlackMessageSchema,
  NodeWaitSchema,
  NodeWebhookSchema,
]);

export const NodeSchema = NodeBaseSchema.extend({
  data: NodeDataSchema,
});

export type Node = z.infer<typeof NodeSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type Frequency = z.infer<typeof FrequencySchema>;
export type RepeatOn = z.infer<typeof RepeatOnSchema>;

export type NodeMemberCreated = z.infer<typeof NodeMemberCreatedSchema>;
export type NodeLevelReached = z.infer<typeof NodeLevelReachedSchema>;
export type NodeLevelDecreased = z.infer<typeof NodeLevelDecreasedSchema>;
export type NodeTagMember = z.infer<typeof NodeTagMemberSchema>;
export type NodeSlackMessage = z.infer<typeof NodeSlackMessageSchema>;
export type NodeWait = z.infer<typeof NodeWaitSchema>;
export type NodeWebhook = z.infer<typeof NodeWebhookSchema>;
