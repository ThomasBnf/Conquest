import type { integrations as IntegrationPrisma } from "@prisma/client";
import { z } from "zod";
import { STATUS } from "./enum/status.enum";

const BaseSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  status: STATUS,
  trigger_token: z.string(),
  trigger_token_expires_at: z.coerce.date(),
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
  user_scopes: z.string(),
});

const DiscourseDetailsSchema = z.object({
  source: z.literal("DISCOURSE"),
  community_url: z.string(),
  api_key: z.string(),
  signature: z.string(),
});

const LinkedInDetailsSchema = z.object({
  source: z.literal("LINKEDIN"),
  access_token: z.string(),
  expire_in: z.number(),
  scopes: z.string(),
});

const LivestormDetailsSchema = z.object({
  source: z.literal("LIVESTORM"),
  organization_id: z.string(),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
});

export const IntegrationDetailsSchema = z.discriminatedUnion("source", [
  SlackDetailsSchema,
  DiscourseDetailsSchema,
  LinkedInDetailsSchema,
  LivestormDetailsSchema,
]);

export const SlackIntegrationSchema = BaseSchema.extend({
  details: SlackDetailsSchema,
});

export const DiscourseIntegrationSchema = BaseSchema.extend({
  details: DiscourseDetailsSchema,
});

export const LinkedInIntegrationSchema = BaseSchema.extend({
  details: LinkedInDetailsSchema,
});

export const LivestormIntegrationSchema = BaseSchema.extend({
  details: LivestormDetailsSchema,
});

export const IntegrationSchema = z.union([
  SlackIntegrationSchema,
  DiscourseIntegrationSchema,
  LinkedInIntegrationSchema,
  LivestormIntegrationSchema,
]) satisfies z.ZodType<IntegrationPrisma>;

export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationDetails = z.infer<typeof IntegrationDetailsSchema>;
export type SlackIntegration = z.infer<typeof SlackIntegrationSchema>;
export type DiscourseIntegration = z.infer<typeof DiscourseIntegrationSchema>;
export type LinkedInIntegration = z.infer<typeof LinkedInIntegrationSchema>;
export type LivestormIntegration = z.infer<typeof LivestormIntegrationSchema>;
