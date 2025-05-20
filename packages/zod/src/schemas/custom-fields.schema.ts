import { z } from "zod";

const CustomFieldBase = z.object({
  id: z.string(),
  label: z.string(),
});

export const FieldTypeSchema = z.enum([
  "text",
  "number",
  "date",
  "select",
  "multi-select",
]);

export const CustomFieldTextSchema = CustomFieldBase.extend({
  type: z.literal("text"),
  value: z.string(),
});

export const CustomFieldNumberSchema = CustomFieldBase.extend({
  type: z.literal("number"),
  value: z.number(),
});

export const CustomFieldDateSchema = CustomFieldBase.extend({
  type: z.literal("date"),
  value: z.string(),
});

export const CustomFieldSelectSchema = CustomFieldBase.extend({
  type: z.literal("select"),
  value: z.string(),
});

export const CustomFieldMultiSelectSchema = CustomFieldBase.extend({
  type: z.literal("multi-select"),
  values: z.array(z.string()),
});

export const CustomFieldSchema = z.discriminatedUnion("type", [
  CustomFieldTextSchema,
  CustomFieldNumberSchema,
  CustomFieldDateSchema,
  CustomFieldSelectSchema,
  CustomFieldMultiSelectSchema,
]);

export type CustomField = z.infer<typeof CustomFieldSchema>;
export type CustomFieldText = z.infer<typeof CustomFieldTextSchema>;
export type CustomFieldNumber = z.infer<typeof CustomFieldNumberSchema>;
export type CustomFieldDate = z.infer<typeof CustomFieldDateSchema>;
export type CustomFieldSelect = z.infer<typeof CustomFieldSelectSchema>;
export type CustomFieldMultiSelect = z.infer<
  typeof CustomFieldMultiSelectSchema
>;
