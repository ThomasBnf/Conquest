import { z } from "zod";
import { STATUS } from "../enum/status.enum";

const BaseSchema = z.object({
  id: z.string().uuid(),
  external_id: z.string().nullable(),
  status: STATUS,
  trigger_token: z.string(),
  expires_at: z.coerce.date(),
  connected_at: z.coerce.date().nullable(),
  created_by: z.string(),
  run_id: z.string().nullable(),
  workspace_id: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const SlackDetailsSchema = z.object({
  source: z.literal("Slack"),
  name: z.string(),
  url: z.string(),
  access_token: z.string(),
  access_token_iv: z.string(),
  user_token: z.string(),
  user_token_iv: z.string(),
  scopes: z.string(),
  user_scopes: z.string(),
});

export const DiscourseDetailsSchema = z.object({
  source: z.literal("Discourse"),
  community_url: z.string(),
  api_key: z.string(),
  api_key_iv: z.string(),
  user_fields: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional(),
});

export const DiscordDetailsSchema = z.object({
  source: z.literal("Discord"),
  name: z.string(),
  access_token: z.string(),
  access_token_iv: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  refresh_token_iv: z.string(),
  scopes: z.string(),
  permissions: z.string(),
});

export const LinkedInDetailsSchema = z.object({
  source: z.literal("Linkedin"),
  name: z.string(),
  access_token: z.string(),
  iv: z.string(),
  scopes: z.string(),
  user_id: z.string(),
});

export const LivestormDetailsSchema = z.object({
  source: z.literal("Livestorm"),
  name: z.string(),
  access_token: z.string(),
  access_token_iv: z.string(),
  refresh_token: z.string(),
  refresh_token_iv: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  filter: z.string().optional(),
});

export const GithubDetailsSchema = z.object({
  source: z.literal("Github"),
  repo: z.string(),
  access_token: z.string(),
  iv: z.string(),
  scope: z.string(),
  owner: z.string(),
});

export const IntegrationDetailsSchema = z.discriminatedUnion("source", [
  DiscordDetailsSchema,
  DiscourseDetailsSchema,
  LinkedInDetailsSchema,
  LivestormDetailsSchema,
  SlackDetailsSchema,
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
]);

export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationDetails = z.infer<typeof IntegrationDetailsSchema>;
export type SlackIntegration = z.infer<typeof SlackIntegrationSchema>;
export type DiscourseIntegration = z.infer<typeof DiscourseIntegrationSchema>;
export type DiscordIntegration = z.infer<typeof DiscordIntegrationSchema>;
export type LinkedInIntegration = z.infer<typeof LinkedInIntegrationSchema>;
export type LivestormIntegration = z.infer<typeof LivestormIntegrationSchema>;
export type GithubIntegration = z.infer<typeof GithubIntegrationSchema>;
