import { z } from "zod";
import { FilterSchema } from "./filters.schema";

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
  category: z.literal("members"),
  isTrigger: z.boolean().default(true),
});

export const NodeRecurringSchema = NodeBaseDataSchema.extend({
  type: z.literal("recurring-workflow"),
  category: z.literal("utilities"),
  frequency: FrequencySchema,
  repeat_on: z.array(RepeatOnSchema),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Provide a valid time in the format HH:MM",
  }),
  isTrigger: z.boolean().default(true),
});

export const NodeManualRunSchema = NodeBaseDataSchema.extend({
  type: z.literal("manual-run"),
  category: z.literal("utilities"),
  isTrigger: z.boolean().default(true),
});

export const NodeListMembersSchema = NodeBaseDataSchema.extend({
  type: z.literal("list-members"),
  category: z.literal("records"),
  filters: z.array(FilterSchema),
});

export const NodeTagMemberSchema = NodeBaseDataSchema.extend({
  type: z.enum(["add-tag", "remove-tag"]),
  category: z.literal("mutations"),
  tags: z.array(z.string()),
});

export const NodeSlackMessage = NodeBaseDataSchema.extend({
  type: z.literal("slack-message"),
  category: z.literal("communications"),
  message: z.string(),
});

export const NodeWaitSchema = NodeBaseDataSchema.extend({
  type: z.literal("wait"),
  category: z.literal("utilities"),
  duration: z.coerce.number(),
  unit: z.enum(["seconds", "minutes", "hours", "days"]),
});

export const NodeWebhookSchema = NodeBaseDataSchema.extend({
  type: z.literal("webhook"),
  category: z.literal("utilities"),
  url: z.string().url().optional(),
  body: z.string().optional(),
});

export const NodeDataLoopSchema = NodeBaseDataSchema.extend({
  type: z.literal("loop"),
  category: z.literal("utilities"),
  sub_nodes: z.array(
    z.discriminatedUnion("type", [
      NodeListMembersSchema,
      NodeTagMemberSchema,
      NodeSlackMessage,
      NodeWaitSchema,
      NodeWebhookSchema,
    ]),
  ),
});

export const NodeLoopSchema = NodeBaseSchema.extend({
  data: NodeDataLoopSchema,
});

export const NodeDataSchema = z.discriminatedUnion("type", [
  NodeMemberCreatedSchema,
  NodeRecurringSchema,
  NodeManualRunSchema,
  NodeListMembersSchema,
  NodeTagMemberSchema,
  NodeSlackMessage,
  NodeWaitSchema,
  NodeWebhookSchema,
  NodeDataLoopSchema,
]);

export const NodeSchema = NodeBaseSchema.extend({
  data: NodeDataSchema,
});

export type Node = z.infer<typeof NodeSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type Frequency = z.infer<typeof FrequencySchema>;
export type RepeatOn = z.infer<typeof RepeatOnSchema>;

export type NodeMemberCreated = z.infer<typeof NodeMemberCreatedSchema>;
export type NodeRecurring = z.infer<typeof NodeRecurringSchema>;
export type NodeManualRun = z.infer<typeof NodeManualRunSchema>;
export type NodeListMembers = z.infer<typeof NodeListMembersSchema>;
export type NodeTagMember = z.infer<typeof NodeTagMemberSchema>;
export type NodeSlackMessage = z.infer<typeof NodeSlackMessage>;
export type NodeWait = z.infer<typeof NodeWaitSchema>;
export type NodeWebhook = z.infer<typeof NodeWebhookSchema>;
export type NodeLoop = z.infer<typeof NodeLoopSchema>;
