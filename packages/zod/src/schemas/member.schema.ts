import { z } from "zod";
import { SOURCE } from "../enum/source.enum";
import { CustomFieldRecordSchema } from "./custom-field.schema";
import { ProfileSchema } from "./profile.schema";

export const MemberSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  primaryEmail: z.string(),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  jobTitle: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  country: z.string().nullable(),
  language: z.string().nullable(),
  tags: z.array(z.string()),
  linkedinUrl: z.string().nullable(),
  levelNumber: z.number().nullable(),
  pulse: z.number(),
  source: SOURCE,
  atRiskMember: z.boolean().optional(),
  potentialAmbassador: z.boolean().optional(),
  customFields: z.array(CustomFieldRecordSchema),
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
  profiles: z.array(ProfileSchema),
  company: z
    .object({
      name: z.string(),
    })
    .nullable(),
  level: z
    .object({
      name: z.string(),
    })
    .nullable(),
});

export type Member = z.infer<typeof MemberSchema>;
export type MemberWithProfiles = z.infer<typeof MemberWithProfilesSchema>;
export type FullMember = z.infer<typeof FullMemberSchema>;
