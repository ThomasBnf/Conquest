import { z } from "zod";
import { RECORD } from "../enum/record.enum";
import { TYPE } from "../enum/type.enum";

export const OptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
});

export const CustomFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: TYPE,
  options: z.array(OptionSchema).optional(),
  record: RECORD,
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CustomField = z.infer<typeof CustomFieldSchema>;
export type Option = z.infer<typeof OptionSchema>;

export const CustomFieldTextSchema = z.object({
  id: z.string(),
  type: z.literal("TEXT"),
  value: z.string(),
});

export const CustomFieldNumberSchema = z.object({
  id: z.string(),
  type: z.literal("NUMBER"),
  value: z.string(),
});

export const CustomFieldDateSchema = z.object({
  id: z.string(),
  type: z.literal("DATE"),
  value: z.coerce.date(),
});

export const CustomFieldSelectSchema = z.object({
  id: z.string(),
  type: z.literal("SELECT"),
  value: z.string().nullable(),
});

export const CustomFieldMultiSelectSchema = z.object({
  id: z.string(),
  type: z.literal("MULTISELECT"),
  values: z.array(z.string()),
});

export const CustomFieldRecordSchema = z.discriminatedUnion("type", [
  CustomFieldTextSchema,
  CustomFieldNumberSchema,
  CustomFieldDateSchema,
  CustomFieldSelectSchema,
  CustomFieldMultiSelectSchema,
]);

export type CustomFieldRecord = z.infer<typeof CustomFieldRecordSchema>;
