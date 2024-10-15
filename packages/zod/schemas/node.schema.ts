import type { icons } from "lucide-react";
import { z } from "zod";
import { FilterSchema } from "./filters.schema";

export const NodeBaseSchema = z.object({
  icon: z.custom<keyof typeof icons>(),
  label: z.string(),
  description: z.string().optional(),
});

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

export const CategorySchema = z.enum([
  "activities_count",
  "last_activity",
  "first_activity",
  "activities",
]);

export const GroupFilterSchema = z.object({
  id: z.string().cuid(),
  category: CategorySchema,
  operator: z.enum(["and", "or"]),
  filters: z.array(FilterSchema),
});

// NODES

export const NodeRecurringSchema = NodeBaseSchema.extend({
  type: z.literal("trigger-recurring-schedule"),
  category: z.literal("utilities"),
  frequency: FrequencySchema,
  repeat_on: z.array(RepeatOnSchema),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Provide a valid time in the format HH:MM",
  }),
});

export const NodeListRecordsSchema = NodeBaseSchema.extend({
  type: z.literal("list-records"),
  category: z.literal("records"),
  source: z.enum(["contacts", "activities"]),
  group_filters: z.array(GroupFilterSchema),
});

export const NodeWebhookSchema = NodeBaseSchema.extend({
  type: z.literal("webhook"),
  url: z.string().url().optional(),
  category: z.literal("utilities"),
});

export const NodeTagContactSchema = NodeBaseSchema.extend({
  type: z.enum(["add-tag", "remove-tag"]),
  category: z.literal("utilities"),
  tags: z.array(z.string()),
});

// NODE DATA

export const NodeDataSchema = z.discriminatedUnion("type", [
  NodeRecurringSchema,
  NodeListRecordsSchema,
  NodeWebhookSchema,
  NodeTagContactSchema,
]);

export const NodeSchema = z.object({
  id: z.string().cuid(),
  type: z.literal("custom"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: NodeDataSchema,
});

// EXPORT TYPE

export type Node = z.infer<typeof NodeSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;

export type Frequency = z.infer<typeof FrequencySchema>;
export type RepeatOn = z.infer<typeof RepeatOnSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type GroupFilter = z.infer<typeof GroupFilterSchema>;

export type NodeRecurringSchedule = z.infer<typeof NodeRecurringSchema>;
export type NodeListRecords = z.infer<typeof NodeListRecordsSchema>;
export type NodeWebhook = z.infer<typeof NodeWebhookSchema>;
