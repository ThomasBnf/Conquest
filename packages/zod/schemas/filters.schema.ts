import { z } from "zod";

export const BaseOperatorSchema = z.enum(["contains", "not_contains"]);
export const DateOperatorSchema = z.enum(["is", "is_not", "before", "after"]);
export const NumberOperatorSchema = z.enum([
  "equals",
  "not_equals",
  "less_than",
  "greater_than",
]);

export const OperatorSchema = z.union([
  BaseOperatorSchema,
  DateOperatorSchema,
  NumberOperatorSchema,
]);

export const DynamicDateSchema = z.enum([
  "today",
  "yesterday",
  "7_days_ago",
  "30_days_ago",
  "days_ago",
]);

// SCHEMAS

export const FilterBaseSchema = z.object({
  id: z.string().cuid(),
  label: z.string(),
});

export const FilterSelectSchema = FilterBaseSchema.extend({
  field: z.enum(["type", "source"]),
  operator: BaseOperatorSchema,
  values: z.array(z.string()).default([]),
});

export const FilterDateSchema = FilterBaseSchema.extend({
  field: z.literal("created_at"),
  operator: DateOperatorSchema,
  dynamic_date: DynamicDateSchema.optional(),
  days: z.number().default(1),
});

export const FilterCountSchema = FilterBaseSchema.extend({
  field: z.literal("activities_count"),
  operator: NumberOperatorSchema,
  value: z.number().default(1),
});

export const FilterSchema = z.discriminatedUnion("field", [
  FilterSelectSchema,
  FilterDateSchema,
  FilterCountSchema,
]);

// TYPES

export type Filter = z.infer<typeof FilterSchema>;
export type FilterSelect = z.infer<typeof FilterSelectSchema>;
export type FilterDate = z.infer<typeof FilterDateSchema>;
export type FilterCount = z.infer<typeof FilterCountSchema>;

export type DynamicDate = z.infer<typeof DynamicDateSchema>;
export type Operator = z.infer<typeof OperatorSchema>;
