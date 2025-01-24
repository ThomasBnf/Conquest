import { z } from "zod";

export const WhoOptionsSchema = z.enum(["who_did", "who_did_not"]);

export const BaseOperatorSchema = z.enum([
  "contains",
  "not_contains",
  "empty",
  "not_empty",
]);
export const DateOperatorSchema = z.enum(["is", "is_not"]);
export const NumberOperatorSchema = z.enum([
  "greater",
  "greater or equal",
  "equal",
  "not equal",
  "less or equal",
  "less",
]);

export const OperatorSchema = z.union([
  BaseOperatorSchema,
  DateOperatorSchema,
  NumberOperatorSchema,
]);

export const DynamicDateSchema = z.enum([
  "today",
  "yesterday",
  "7 days",
  "30 days",
  "90 days",
  "365 days",
]);

export const FilterBaseSchema = z.object({
  id: z.string().cuid(),
  label: z.string(),
});

export const FilterSelectSchema = FilterBaseSchema.extend({
  type: z.literal("select"),
  field: z.enum(["source", "language", "country", "tags", "linked_profiles"]),
  operator: BaseOperatorSchema,
  values: z.array(z.string()).default([]),
});

export const FilterDateSchema = FilterBaseSchema.extend({
  type: z.literal("date"),
  field: z.literal("created_at"),
  operator: DateOperatorSchema,
  dynamic_date: DynamicDateSchema.optional(),
  days: z.number().default(1),
});

export const FilterTextSchema = FilterBaseSchema.extend({
  type: z.literal("text"),
  field: z.enum(["job_title", "primary_email", "phones"]),
  operator: BaseOperatorSchema,
  value: z.string().default(""),
});

export const FilterNumberSchema = FilterBaseSchema.extend({
  type: z.literal("number"),
  field: z.enum(["pulse"]),
  operator: NumberOperatorSchema,
  value: z.number().min(0).default(1),
});

export const FilterLevelSchema = FilterBaseSchema.extend({
  type: z.literal("level"),
  field: z.enum(["level"]),
  operator: NumberOperatorSchema,
  value: z.number().min(1).max(12),
});

export const FilterActivitySchema = FilterBaseSchema.extend({
  type: z.literal("activity"),
  field: z.enum(["activity_type"]),
  who: z.enum(["who_did", "who_did_not"]),
  activity_types: z
    .object({
      key: z.string(),
      name: z.string(),
    })
    .array(),
  operator: NumberOperatorSchema,
  value: z.number().min(0).default(1),
  channel: z.object({
    id: z.string(),
    label: z.string(),
  }),
  dynamic_date: DynamicDateSchema.optional(),
  days: z.number().default(1),
  display_count: z.boolean().default(false),
});

export const FilterSchema = z.discriminatedUnion("type", [
  FilterSelectSchema,
  FilterDateSchema,
  FilterTextSchema,
  FilterNumberSchema,
  FilterLevelSchema,
  FilterActivitySchema,
]);

export type Filter = z.infer<typeof FilterSchema>;
export type FilterSelect = z.infer<typeof FilterSelectSchema>;
export type FilterDate = z.infer<typeof FilterDateSchema>;
export type FilterText = z.infer<typeof FilterTextSchema>;
export type FilterNumber = z.infer<typeof FilterNumberSchema>;
export type FilterLevel = z.infer<typeof FilterLevelSchema>;
export type FilterActivity = z.infer<typeof FilterActivitySchema>;
export type DynamicDate = z.infer<typeof DynamicDateSchema>;

export type WhoOptions = z.infer<typeof WhoOptionsSchema>;
export type Operator = z.infer<typeof OperatorSchema>;
export type NumberOperator = z.infer<typeof NumberOperatorSchema>;
