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
  ">",
  ">=",
  "equal",
  "not_equal",
  "<=",
  "<",
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
  id: z.string().uuid(),
  label: z.string(),
});

export const FilterSelectSchema = FilterBaseSchema.extend({
  type: z.literal("select"),
  field: z.enum(["country", "language", "profiles", "source", "tags"]),
  operator: BaseOperatorSchema,
  values: z.array(z.string()).default([]),
});

export const FilterDateSchema = FilterBaseSchema.extend({
  type: z.literal("date"),
  field: z.literal("createdAt"),
  operator: DateOperatorSchema,
  dynamicDate: DynamicDateSchema.optional(),
  days: z.number().default(1),
});

export const FilterTextSchema = FilterBaseSchema.extend({
  type: z.literal("text"),
  field: z.enum(["jobTitle", "email", "phones"]).or(z.string()),
  operator: BaseOperatorSchema,
  value: z.string().default(""),
});

export const FilterNumberSchema = FilterBaseSchema.extend({
  type: z.literal("number"),
  field: z.enum(["pulse", "level", "github-followers"]),
  operator: NumberOperatorSchema,
  value: z.number().min(0).default(1),
});

export const FilterLevelSchema = FilterBaseSchema.extend({
  type: z.literal("level"),
  field: z.literal("level"),
  operator: NumberOperatorSchema,
  value: z.number(),
});

export const FilterActivitySchema = FilterBaseSchema.extend({
  type: z.literal("activity"),
  field: z.enum(["activityType"]),
  who: WhoOptionsSchema,
  activityTypes: z
    .object({
      key: z.string(),
      name: z.string(),
    })
    .array(),
  operator: NumberOperatorSchema,
  value: z.number().min(0).default(1),
  channels: z
    .object({
      id: z.string(),
      label: z.string(),
    })
    .array(),
  dynamicDate: DynamicDateSchema.optional(),
  days: z.number().default(1),
  displayCount: z.boolean(),
  displayDate: z.boolean(),
  displayChannel: z.boolean(),
});

export const FilterSchema = z.discriminatedUnion("type", [
  FilterSelectSchema,
  FilterDateSchema,
  FilterTextSchema,
  FilterNumberSchema,
  FilterActivitySchema,
  FilterLevelSchema,
]);

export const GroupFiltersSchema = z.object({
  filters: z.array(FilterSchema),
  operator: z.enum(["AND", "OR"]),
});

export type Filter = z.infer<typeof FilterSchema>;
export type GroupFilters = z.infer<typeof GroupFiltersSchema>;
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
