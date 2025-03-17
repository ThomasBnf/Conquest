import { z } from "zod";

export const planIntegrationsSchema = z.object({
  count: z.union([z.number(), z.string()]),
  community: z.boolean(),
  github: z.boolean(),
  api: z.boolean(),
  socials: z.boolean(),
  events: z.boolean(),
});

export const planFeaturesSchema = z.object({
  memberLevel: z.boolean(),
  tags: z.string(),
  lists: z.string(),
  activityTypes: z.string(),
});

export const planSchema = z.object({
  name: z.string(),
  priceMonthly: z.union([z.number(), z.string()]),
  priceAnnually: z.union([z.number(), z.string()]),
  seats: z.union([z.number(), z.string()]),
  members: z.string(),
  integrations: planIntegrationsSchema,
  features: planFeaturesSchema,
});

export type PlanIntegrations = z.infer<typeof planIntegrationsSchema>;
export type PlanFeatures = z.infer<typeof planFeaturesSchema>;
export type Plan = z.infer<typeof planSchema>;
export type PlanPeriod = "monthly" | "annually";
