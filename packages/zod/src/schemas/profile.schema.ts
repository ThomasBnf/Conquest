import { z } from "zod";

export const CustomFieldSchema = z.object({
  id: z.string(),
  value: z.string(),
});

export const BaseProfileSchema = z.object({
  id: z.string().uuid(),
  external_id: z.string().nullable(),
  member_id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const DiscordAttributesSchema = z.object({
  source: z.literal("Discord"),
  username: z.string(),
});

export const DiscourseAttributesSchema = z.object({
  source: z.literal("Discourse"),
  username: z.string(),
  custom_fields: z.array(CustomFieldSchema).optional(),
});

export const GithubAttributesSchema = z.object({
  source: z.literal("Github"),
  login: z.string(),
  bio: z.string().nullish(),
  blog: z.string().nullish(),
  followers: z.coerce.number(),
  location: z.string().nullish(),
});

export const LinkedInAttributesSchema = z.object({
  source: z.literal("Linkedin"),
});

export const LivestormAttributesSchema = z.object({
  source: z.literal("Livestorm"),
});

export const SlackAttributesSchema = z.object({
  source: z.literal("Slack"),
});

export const TwitterAttributesSchema = z.object({
  source: z.literal("Twitter"),
  username: z.string(),
});

export const ProfileAttributesSchema = z.discriminatedUnion("source", [
  DiscordAttributesSchema,
  DiscourseAttributesSchema,
  GithubAttributesSchema,
  LinkedInAttributesSchema,
  LivestormAttributesSchema,
  SlackAttributesSchema,
  TwitterAttributesSchema,
]);

export const DiscordProfileSchema = BaseProfileSchema.extend({
  attributes: DiscordAttributesSchema,
});

export const DiscourseProfileSchema = BaseProfileSchema.extend({
  attributes: DiscourseAttributesSchema,
});

export const GithubProfileSchema = BaseProfileSchema.extend({
  attributes: GithubAttributesSchema,
});

export const LinkedInProfileSchema = BaseProfileSchema.extend({
  attributes: LinkedInAttributesSchema,
});

export const LivestormProfileSchema = BaseProfileSchema.extend({
  attributes: LivestormAttributesSchema,
});

export const SlackProfileSchema = BaseProfileSchema.extend({
  attributes: SlackAttributesSchema,
});

export const TwitterProfileSchema = BaseProfileSchema.extend({
  attributes: TwitterAttributesSchema,
});

export const ProfileSchema = z.union([
  DiscordProfileSchema,
  DiscourseProfileSchema,
  GithubProfileSchema,
  LinkedInProfileSchema,
  LivestormProfileSchema,
  SlackProfileSchema,
  TwitterProfileSchema,
]);

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileAttributes = z.infer<typeof ProfileAttributesSchema>;
export type DiscordProfile = z.infer<typeof DiscordProfileSchema>;
export type DiscourseProfile = z.infer<typeof DiscourseProfileSchema>;
export type GithubProfile = z.infer<typeof GithubProfileSchema>;
export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>;
export type LivestormProfile = z.infer<typeof LivestormProfileSchema>;
export type SlackProfile = z.infer<typeof SlackProfileSchema>;
export type TwitterProfile = z.infer<typeof TwitterProfileSchema>;
