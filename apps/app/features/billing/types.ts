import { z } from "zod";

export const planSchema = z.object({
  name: z.string(),
  description: z.string(),
  priceMonthly: z.union([z.number(), z.string()]),
  priceAnnually: z.union([z.number(), z.string()]),
  reduction: z.number().optional(),
  priceIdMonthly: z.string(),
  priceIdAnnually: z.string(),
  seats: z.string(),
  members: z.string(),
  integrations: z.string(),
  api: z.boolean(),
  popular: z.boolean().optional(),
});

export const integrationsSchema = z.object({
  count: z.union([z.number(), z.string()]),
  community: z.boolean(),
  github: z.boolean(),
  api: z.boolean(),
  socials: z.boolean(),
  events: z.boolean(),
});

export const featuresSchema = z.object({
  memberLevel: z.boolean(),
  tags: z.string(),
  lists: z.string(),
  activityTypes: z.string(),
});

export const plansTableSchema = z.object({
  name: z.string(),
  priceMonthly: z.union([z.number(), z.string()]),
  priceAnnually: z.union([z.number(), z.string()]),
  reduction: z.number().nullable(),
  seats: z.union([z.number(), z.string()]),
  members: z.string(),
  integrations: integrationsSchema,
  features: featuresSchema,
});

export type Plan = z.infer<typeof planSchema>;
export type PlanTable = z.infer<typeof plansTableSchema>;
export type PlanPeriod = "monthly" | "annually";
