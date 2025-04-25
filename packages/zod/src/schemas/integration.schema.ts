import { z } from "zod";
import { STATUS } from "../enum/status.enum";

const BaseSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string().nullable(),
  status: STATUS,
  triggerToken: z.string(),
  expiresAt: z.coerce.date(),
  connectedAt: z.coerce.date().nullable(),
  createdBy: z.string(),
  runId: z.string().nullable(),
  workspaceId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const SlackDetailsSchema = z.object({
  source: z.literal("Slack"),
  name: z.string(),
  url: z.string(),
  accessToken: z.string(),
  accessTokenIv: z.string(),
  userToken: z.string(),
  userTokenIv: z.string(),
  scopes: z.string(),
  userScopes: z.string(),
});

export const DiscourseDetailsSchema = z.object({
  source: z.literal("Discourse"),
  communityUrl: z.string(),
  apiKey: z.string(),
  apiKeyIv: z.string(),
  userFields: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional(),
});

export const DiscordDetailsSchema = z.object({
  source: z.literal("Discord"),
  name: z.string(),
  accessToken: z.string(),
  accessTokenIv: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string(),
  refreshTokenIv: z.string(),
  scopes: z.string(),
  permissions: z.string(),
});

export const LinkedInDetailsSchema = z.object({
  source: z.literal("Linkedin"),
  name: z.string(),
  accessToken: z.string(),
  iv: z.string(),
  scopes: z.string(),
  userId: z.string(),
});

export const LivestormDetailsSchema = z.object({
  source: z.literal("Livestorm"),
  name: z.string(),
  accessToken: z.string(),
  accessTokenIv: z.string(),
  refreshToken: z.string(),
  refreshTokenIv: z.string(),
  expiresIn: z.number(),
  scope: z.string(),
  filter: z.string().optional(),
});

export const GithubDetailsSchema = z.object({
  source: z.literal("Github"),
  repo: z.string(),
  accessToken: z.string(),
  iv: z.string(),
  installationId: z.coerce.number(),
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
