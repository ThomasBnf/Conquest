import type { integrations as IntegrationPrisma } from "@prisma/client";
import { z } from "zod";
import { STATUS } from "../enum/status.enum";

const BaseSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  status: STATUS,
  trigger_token: z.string(),
  trigger_token_expires_at: z.coerce.date(),
  connected_at: z.coerce.date().nullable(),
  created_by: z.string().cuid(),
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
  user_fields: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional(),
});

const DiscordDetailsSchema = z.object({
  source: z.literal("DISCORD"),
  name: z.string(),
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scopes: z.string(),
  permissions: z.string(),
});

const LinkedInDetailsSchema = z.object({
  source: z.literal("LINKEDIN"),
  name: z.string(),
  access_token: z.string(),
  scopes: z.string(),
  user_id: z.string(),
});

const LivestormDetailsSchema = z.object({
  source: z.literal("LIVESTORM"),
  name: z.string(),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  filter: z.string().optional(),
});

const GithubDetailsSchema = z.object({
  source: z.literal("GITHUB"),
  access_token: z.string(),
  scope: z.string(),
});

export const IntegrationDetailsSchema = z.discriminatedUnion("source", [
  SlackDetailsSchema,
  DiscourseDetailsSchema,
  DiscordDetailsSchema,
  LinkedInDetailsSchema,
  LivestormDetailsSchema,
  GithubDetailsSchema,
]);

export const SlackIntegrationSchema = BaseSchema.extend({
  details: SlackDetailsSchema,
});

export const DiscourseIntegrationSchema = BaseSchema.extend({
  details: DiscourseDetailsSchema,
});

export const DiscordIntegrationSchema = BaseSchema.extend({
  details: DiscordDetailsSchema,
});

export const LinkedInIntegrationSchema = BaseSchema.extend({
  details: LinkedInDetailsSchema,
});

export const LivestormIntegrationSchema = BaseSchema.extend({
  details: LivestormDetailsSchema,
});

export const GithubIntegrationSchema = BaseSchema.extend({
  details: GithubDetailsSchema,
});

export const IntegrationSchema = z.union([
  SlackIntegrationSchema,
  DiscourseIntegrationSchema,
  DiscordIntegrationSchema,
  LinkedInIntegrationSchema,
  LivestormIntegrationSchema,
  GithubIntegrationSchema,
]) satisfies z.ZodType<IntegrationPrisma>;

export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationDetails = z.infer<typeof IntegrationDetailsSchema>;
export type SlackIntegration = z.infer<typeof SlackIntegrationSchema>;
export type DiscourseIntegration = z.infer<typeof DiscourseIntegrationSchema>;
export type DiscordIntegration = z.infer<typeof DiscordIntegrationSchema>;
export type LinkedInIntegration = z.infer<typeof LinkedInIntegrationSchema>;
export type LivestormIntegration = z.infer<typeof LivestormIntegrationSchema>;
export type GithubIntegration = z.infer<typeof GithubIntegrationSchema>;
