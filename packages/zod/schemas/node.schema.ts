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

export const NodeTypeSchema = z.enum([
  "trigger-recurring-schedule",
  "trigger-manual-run",
  "list-records",
  "add-tag",
  "remove-tag",
  "webhook",
]);

export const CategorySchema = z.enum([
  "last_activity",
  "first_activity",
  "activities",
  "activities_count",
  "tags",
]);

export const GroupFilterSchema = z.object({
  id: z.string().cuid(),
  category: CategorySchema,
  operator: z.enum(["and", "or"]),
  filters: z.array(FilterSchema),
});

// NODES

export const NodeBaseSchema = z.object({
  id: z.string().cuid(),
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

export const NodeRecurringSchema = NodeBaseDataSchema.extend({
  type: z.literal("recurring-schedule"),
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
  group_filters: z.array(GroupFilterSchema),
});

export const NodeTagMemberSchema = NodeBaseDataSchema.extend({
  type: z.enum(["add-tag", "remove-tag"]),
  category: z.literal("mutations"),
  tags: z.array(z.string()),
});

export const NodeWebhookSchema = NodeBaseDataSchema.extend({
  type: z.literal("webhook"),
  category: z.literal("utilities"),
  url: z.string().url().optional(),
});

export const NodeDataSchema = z.discriminatedUnion("type", [
  NodeRecurringSchema,
  NodeManualRunSchema,
  NodeListMembersSchema,
  NodeTagMemberSchema,
  NodeWebhookSchema,
]);

export const NodeSchema = NodeBaseSchema.extend({
  data: NodeDataSchema,
});

export type Node = z.infer<typeof NodeSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type Frequency = z.infer<typeof FrequencySchema>;
export type RepeatOn = z.infer<typeof RepeatOnSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type GroupFilter = z.infer<typeof GroupFilterSchema>;

export type NodeRecurring = z.infer<typeof NodeRecurringSchema>;
export type NodeManualRun = z.infer<typeof NodeManualRunSchema>;
export type NodeListMembers = z.infer<typeof NodeListMembersSchema>;
export type NodeTagMember = z.infer<typeof NodeTagMemberSchema>;
export type NodeWebhook = z.infer<typeof NodeWebhookSchema>;
