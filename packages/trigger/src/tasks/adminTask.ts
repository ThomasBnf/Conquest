import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { ActivityTypeRuleSchema } from "@conquest/zod/schemas/activity-type.schema";
import { CustomFieldRecordSchema } from "@conquest/zod/schemas/custom-field.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { client } from "../client";

export const CHLevelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  number: z.number(),
  from: z.number(),
  to: z.number().nullable(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CHCompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  industry: z.string(),
  address: z.string(),
  domain: z.string(),
  employees: z.number().nullable(),
  foundedAt: z.coerce.date().nullable(),
  logoUrl: z.string(),
  tags: z.array(z.string()),
  source: SOURCE,
  customFields: z.object({
    fields: z.array(CustomFieldRecordSchema),
  }),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CHMemberSchema = z.object({
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
    fields: z.array(CustomFieldRecordSchema),
  }),
  companyId: z.string().nullable(),
  isStaff: z.boolean(),
  workspaceId: z.string(),
  firstActivity: z.coerce.date().nullable(),
  lastActivity: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CHActivityTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  source: SOURCE,
  key: z.string(),
  points: z.coerce.number().int().min(0),
  conditions: z.object({
    rules: z.array(ActivityTypeRuleSchema),
  }),
  deletable: z.boolean(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CHActivitySchema = z.object({
  id: z.string().uuid(),
  externalId: z.string(),
  title: z.string(),
  message: z.string(),
  replyTo: z.string(),
  reactTo: z.string(),
  inviteTo: z.string(),
  source: SOURCE,
  activityTypeId: z.string().uuid(),
  channelId: z.string().uuid().nullable(),
  eventId: z.string().uuid().nullable(),
  memberId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CHChannelSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  name: z.string(),
  source: SOURCE,
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

type CHActivity = z.infer<typeof CHActivitySchema>;

export const adminTask = schemaTask({
  id: "admin",
  machine: "large-2x",
  schema: z.object({
    user: UserSchema,
  }),
  run: async ({ user }) => {
    if (user.role !== "STAFF") return;

    await prisma.member.deleteMany();
    await prisma.company.deleteMany();
    await prisma.level.deleteMany();
    await prisma.activityType.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.channel.deleteMany();

    const workspaces = await prisma.workspace.findMany();

    const resultLevel = await client.query({
      query: `
        SELECT *
        FROM level
        WHERE workspaceId IN (${workspaces.map((w) => `'${w.id}'`).join(",")})
      `,
    });

    const { data: dataLevel } = await resultLevel.json();
    const levels = CHLevelSchema.array().parse(dataLevel);

    console.log("levels", levels.length);

    await prisma.level.createMany({
      data: levels.map((level) => ({
        number: level.number,
        name: level.name,
        from: level.from,
        to: level.to,
        workspaceId: level.workspaceId,
        createdAt: level.createdAt,
        updatedAt: level.updatedAt,
      })),
    });

    const resultCompany = await client.query({
      query: `
        SELECT *
        FROM company FINAL
        WHERE workspaceId IN (${workspaces.map((w) => `'${w.id}'`).join(",")})
      `,
    });
    const { data: dataCompany } = await resultCompany.json();
    const companies = CHCompanySchema.array().parse(dataCompany);

    console.log("companies", companies.length);

    await prisma.company.createMany({
      data: companies.map((company) => ({
        ...company,
        customFields: company.customFields.fields,
      })),
    });

    const resultMembers = await client.query({
      query: `
        SELECT *
        FROM member FINAL
        WHERE workspaceId IN (${workspaces.map((w) => `'${w.id}'`).join(",")})
      `,
    });

    const { data } = await resultMembers.json();
    const members = CHMemberSchema.array().parse(data);

    console.log("members", members.length);

    await prisma.member.createMany({
      data: members.map((member) => {
        const { levelId, ...rest } = member;

        const level = levels.find((l) => l.id === levelId);
        const company = companies.find((c) => c.id === member.companyId);

        return {
          ...rest,
          levelNumber: level?.number,
          customFields: member.customFields.fields,
          companyId: company ? member.companyId : null,
        };
      }),
    });

    const memberIds = new Set(members.map((member) => member.id));

    const resultProfiles = await client.query({
      query: `
        SELECT *
        FROM profile FINAL
        WHERE workspaceId IN (${workspaces.map((w) => `'${w.id}'`).join(",")})
      `,
    });

    const { data: dataProfiles } = await resultProfiles.json();
    const profiles = ProfileSchema.array().parse(dataProfiles);

    console.log("profiles", profiles.length);

    const uniqueProfilesMap = new Map();

    for (const profile of profiles) {
      const key = `${profile.externalId}_${profile.workspaceId}`;
      if (memberIds.has(profile.memberId)) {
        uniqueProfilesMap.set(key, profile);
      }
    }

    const uniqueProfiles = Array.from(uniqueProfilesMap.values());

    console.log("valid profiles", uniqueProfiles.length);

    await prisma.profile.createMany({
      data: uniqueProfiles.map((profile) => profile),
    });

    const resultChannels = await client.query({
      query: `
        SELECT *
        FROM channel
        WHERE workspaceId IN (${workspaces.map((w) => `'${w.id}'`).join(",")})
      `,
    });

    const { data: dataChannels } = await resultChannels.json();
    const channels = CHChannelSchema.array().parse(dataChannels);

    console.log("channels", channels.length);

    await prisma.channel.createMany({
      data: channels.map((channel) => channel),
    });

    const resultActivityTypes = await client.query({
      query: `
        SELECT *
        FROM activityType FINAL
        WHERE workspaceId IN (${workspaces.map((w) => `'${w.id}'`).join(",")})
      `,
    });

    const { data: dataActivityTypes } = await resultActivityTypes.json();
    const activityTypes = CHActivityTypeSchema.array().parse(dataActivityTypes);

    console.log("activityTypes", activityTypes.length);

    await prisma.activityType.createMany({
      data: activityTypes.map((activityType) => {
        const { id, ...rest } = activityType;

        return {
          ...rest,
          key: activityType.key,
          conditions: activityType.conditions.rules,
        };
      }),
    });

    const resultActivities = await client.query({
      query: `
        SELECT * 
        FROM activity
        WHERE workspaceId IN (${workspaces.map((w) => `'${w.id}'`).join(",")})
      `,
    });

    const { data: dataActivities } = await resultActivities.json();
    const activities = CHActivitySchema.array().parse(dataActivities);

    console.log("activities", activities.length);

    const uniqueActivitiesMap = new Map();

    for (const activity of activities) {
      const key = `${activity.externalId}_${activity.workspaceId}`;
      // Ne garder que la première occurrence de chaque activité unique
      if (!uniqueActivitiesMap.has(key)) {
        uniqueActivitiesMap.set(key, activity);
      }
    }

    // Convertir le Map en tableau d'activités uniques
    const uniqueActivities = Array.from(uniqueActivitiesMap.values());
    console.log("unique activities", uniqueActivities.length);

    // Créer un Set des IDs de canaux pour une recherche rapide
    const channelIds = new Set(channels.map((channel) => channel.id));

    // Filtrer les activités pour ne garder que celles sans channelId ou avec un channelId valide
    const validActivities = uniqueActivities.filter(
      (activity) =>
        (!activity.channelId || channelIds.has(activity.channelId)) &&
        memberIds.has(activity.memberId),
    );

    console.log("valid activities", validActivities.length);

    await prisma.activity.createMany({
      data: validActivities.map((activity) => {
        const { activityTypeId, message, title, ...rest } =
          activity as CHActivity;

        const activityType = activityTypes.find(
          (at) => at.id === activityTypeId,
        );

        const cleanMessage = message.replace(/\0/g, "");
        const cleanTitle = title.replace(/\0/g, "");

        return {
          ...rest,
          message: cleanMessage,
          title: cleanTitle,
          activityTypeKey: activityType?.key!,
        };
      }),
    });
  },
});
