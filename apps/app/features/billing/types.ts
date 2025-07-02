import { z } from "zod";

export const PlansSchema = z.object({
  name: z.string(),
  description: z.string(),
  priceMonthly: z.union([z.number(), z.string()]),
  priceAnnually: z.union([z.number(), z.string()]),
  reduction: z.number().optional(),
  priceIdMonthly: z.array(z.string()),
  priceIdAnnually: z.array(z.string()),
  seats: z.string(),
  members: z.string(),
  integrations: z.string(),
  api: z.boolean(),
  popular: z.boolean().optional(),
});

export const integrationsSchema = z.object({
  count: z.union([z.number(), z.string()]),
  discord: z.boolean(),
  discourse: z.boolean(),
  slack: z.boolean(),
  github: z.boolean(),
  api: z.boolean(),
  livestorm: z.boolean(),
});

export const featuresSchema = z.object({
  memberLevel: z.boolean(),
  tags: z.string(),
  lists: z.string(),
  activityTypes: z.string(),
  tasks: z.string(),
});

export const PlansTableSchema = z.object({
  name: z.string(),
  priceMonthly: z.union([z.number(), z.string()]),
  priceAnnually: z.union([z.number(), z.string()]),
  reduction: z.number().nullable(),
  seats: z.union([z.number(), z.string()]),
  members: z.string(),
  workflows: z.object({
    included: z.string(),
    additional: z.union([z.number(), z.string()]),
  }),
  integrations: integrationsSchema,
  features: featuresSchema,
});

export type Plans = z.infer<typeof PlansSchema>;
export type PlansTable = z.infer<typeof PlansTableSchema>;
export type PlanPeriod = "monthly" | "annually";
