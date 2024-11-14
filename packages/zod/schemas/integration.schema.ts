import { STATUS } from "@conquest/zod/status.enum";
import { z } from "zod";

export const PointsConfigSchema = z.object({
  post: z.number().default(1),
  reaction: z.number().default(1),
  reply: z.number().default(1),
  invitation: z.number().default(1),
});

const BaseSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  status: STATUS,
  installed_at: z.coerce.date().nullable(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const SlackDetailsSchema = z.object({
  source: z.literal("SLACK"),
  name: z.string(),
  token: z.string(),
  slack_user_token: z.string(),
  scopes: z.string(),
  points_config: PointsConfigSchema,
});

const DiscourseDetailsSchema = z.object({
  source: z.literal("DISCOURSE"),
  community_url: z.string(),
  api_key: z.string(),
  signature: z.string(),
  points_config: PointsConfigSchema,
});

export const IntegrationDetailsSchema = z.discriminatedUnion("source", [
  SlackDetailsSchema,
  DiscourseDetailsSchema,
]);

export const SlackIntegrationSchema = BaseSchema.extend({
  details: SlackDetailsSchema,
});

export const DiscourseIntegrationSchema = BaseSchema.extend({
  details: DiscourseDetailsSchema,
});

export const IntegrationSchema = z.union([
  SlackIntegrationSchema,
  DiscourseIntegrationSchema,
]);

export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationDetails = z.infer<typeof IntegrationDetailsSchema>;
export type PointsConfig = z.infer<typeof PointsConfigSchema>;
export type SlackIntegration = z.infer<typeof SlackIntegrationSchema>;
export type DiscourseIntegration = z.infer<typeof DiscourseIntegrationSchema>;
