import { z } from "zod";
import { SOURCE } from "../enum/source.enum";
import {
  CustomFieldSchema,
  ProfileAttributesSchema,
  ProfileSchema,
} from "./profile.schema";

export const MemberSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  primaryEmail: z.string(),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  jobTitle: z.string(),
  avatarUrl: z.string(),
  country: z.string(),
  language: z.string(),
  tags: z.array(z.string().uuid()),
  linkedinUrl: z.string(),
  levelId: z.string().nullable(),
  pulse: z.number(),
  source: SOURCE,
  atRiskMember: z.boolean().optional(),
  potentialAmbassador: z.boolean().optional(),
  customFields: z.object({
    fields: z.array(CustomFieldSchema),
  }),
  companyId: z.string().nullable(),
  isStaff: z.boolean(),
  workspaceId: z.string(),
  firstActivity: z.coerce.date().nullable(),
  lastActivity: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const MemberWithProfilesSchema = MemberSchema.extend({
  profiles: z.array(ProfileSchema),
});

export const FullMemberSchema = MemberSchema.extend({
  company: z.string(),
  level: z.number(),
  levelName: z.string().optional(),
  attributes: z.array(ProfileAttributesSchema),
});

export const MemberWithLevelSchema = MemberSchema.extend({
  level: z.number(),
  levelName: z.string().optional(),
});

export type Member = z.infer<typeof MemberSchema>;
export type MemberWithProfiles = z.infer<typeof MemberWithProfilesSchema>;
export type FullMember = z.infer<typeof FullMemberSchema>;
export type MemberWithLevel = z.infer<typeof MemberWithLevelSchema>;
