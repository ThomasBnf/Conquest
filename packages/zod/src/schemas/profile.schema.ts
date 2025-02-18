import type { profile as ProfilePrisma } from "@prisma/client";
import { z } from "zod";

export const CustomFieldSchema = z.object({
  id: z.string(),
  value: z.string(),
});

export const BaseProfileSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().nullable(),
  member_id: z.string().cuid(),
  workspace_id: z.string().cuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const DiscordAttributesSchema = z.object({
  source: z.literal("DISCORD"),
  username: z.string(),
});

export const DiscourseAttributesSchema = z.object({
  source: z.literal("DISCOURSE"),
  username: z.string(),
  custom_fields: z.array(CustomFieldSchema).optional(),
});

export const GithubAttributesSchema = z.object({
  source: z.literal("GITHUB"),
  username: z.string(),
  bio: z.string().nullable(),
  blog: z.string().nullable(),
  followers: z.number(),
  location: z.string().nullable(),
});

export const LinkedInAttributesSchema = z.object({
  source: z.literal("LINKEDIN"),
});

export const LivestormAttributesSchema = z.object({
  source: z.literal("LIVESTORM"),
});

export const SlackAttributesSchema = z.object({
  source: z.literal("SLACK"),
});

export const XAttributesSchema = z.object({
  source: z.literal("X"),
  username: z.string(),
});

export const ProfileAttributesSchema = z.discriminatedUnion("source", [
  DiscordAttributesSchema,
  DiscourseAttributesSchema,
  GithubAttributesSchema,
  LinkedInAttributesSchema,
  LivestormAttributesSchema,
  SlackAttributesSchema,
  XAttributesSchema,
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

export const XProfileSchema = BaseProfileSchema.extend({
  attributes: XAttributesSchema,
});

export const ProfileSchema = z.union([
  DiscordProfileSchema,
  DiscourseProfileSchema,
  GithubProfileSchema,
  LinkedInProfileSchema,
  LivestormProfileSchema,
  SlackProfileSchema,
  XProfileSchema,
]) satisfies z.ZodType<ProfilePrisma>;

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileAttributes = z.infer<typeof ProfileAttributesSchema>;
export type DiscordProfile = z.infer<typeof DiscordProfileSchema>;
export type DiscourseProfile = z.infer<typeof DiscourseProfileSchema>;
export type GithubProfile = z.infer<typeof GithubProfileSchema>;
export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>;
export type LivestormProfile = z.infer<typeof LivestormProfileSchema>;
export type SlackProfile = z.infer<typeof SlackProfileSchema>;
export type XProfile = z.infer<typeof XProfileSchema>;
