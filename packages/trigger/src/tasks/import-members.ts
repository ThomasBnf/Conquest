import { getMember } from "@conquest/db/member/getMember";
import { prisma } from "@conquest/db/prisma";
import { getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { resend } from "@conquest/resend";
import ImportFailure from "@conquest/resend/emails/import-failure";
import ImportSuccess from "@conquest/resend/emails/import-success";
import { Member } from "@conquest/zod/schemas/member.schema";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getFieldsValue } from "../csv/getFieldsValue";
import { getMemberByExternalId } from "../csv/getMemberByExternalId";
import { processCompanies } from "../csv/processCompanies";
import { processDiscordProfiles } from "../csv/processDiscordProfiles";
import { processGithubProfiles } from "../csv/processGithubProfiles";
import { processOptions } from "../csv/processOptions";
import { processProfiles } from "../csv/processProfiles";
import { processSlackProfiles } from "../csv/processSlackProfiles";
import { processTags } from "../csv/processTags";
import { csvInfoSchema } from "../csv/schemas/csv-info.schema";

export const importMembers = schemaTask({
  id: "import-members",
  machine: "small-2x",
  schema: z.object({
    user: UserSchema,
    mappedColumns: z.record(z.string(), z.string()),
    csvInfo: csvInfoSchema,
  }),
  run: async ({ user, mappedColumns, csvInfo }) => {
    const { workspaceId } = user;
    const { rows } = csvInfo;

    const members: Record<string, string>[] = rows.map((row) =>
      Object.fromEntries(
        Object.entries(row)
          .filter(
            ([key]) => mappedColumns[key] && mappedColumns[key] !== "undefined",
          )
          .map(([key, value]) => [mappedColumns[key], value]),
      ),
    );

    const customFields = await processOptions({
      members,
      mappedColumns,
      workspaceId,
    });

    const createdTags = await processTags({ members, workspaceId });
    const createdCompanies = await processCompanies({ members, workspaceId });

    const importedMembers: Member[] = [];
    const updatedMembers: Member[] = [];

    for (const member of members) {
      const {
        firstName,
        lastName,
        avatarUrl,
        country,
        language,
        jobTitle,
        primaryEmail,
        emails,
        phones,
        linkedinUrl,
        company,
        tags,
      } = member;

      const emailsArray = emails ? emails.split(",") : [];
      const _emails = [...new Set([primaryEmail, ...emailsArray])];

      const phonesArray = phones ? phones.split(",") : [];
      const _phones = [...new Set(phonesArray)];

      const _tags = createdTags.filter((tag) => tags?.includes(tag.name));
      const _company = createdCompanies.find((c) => c?.name === company);

      const existingMember = primaryEmail
        ? await getMember({ primaryEmail, workspaceId })
        : null;

      const fields = getFieldsValue({ customFields, member });

      if (existingMember) {
        const updatedMember = {
          ...existingMember,
          firstName: firstName ?? existingMember.firstName,
          lastName: lastName ?? existingMember.lastName,
          jobTitle: jobTitle ?? existingMember.jobTitle,
          avatarUrl: avatarUrl ?? existingMember.avatarUrl,
          country: country ?? existingMember.country,
          language: language ?? existingMember.language,
          linkedinUrl: linkedinUrl ?? existingMember.linkedinUrl,
          tags: _tags.map((tag) => tag.id),
          companyId: _company?.id ?? existingMember.companyId,
          emails: _emails.filter(Boolean) as string[],
          phones: _phones.filter(Boolean) as string[],
          customFields: [...existingMember.customFields, ...fields],
          updatedAt: new Date(),
        };

        await processProfiles({
          memberId: existingMember.id,
          memberData: member,
          workspaceId,
        });

        updatedMembers.push(updatedMember);
      } else {
        const existingMember = await getMemberByExternalId({
          memberData: member,
          workspaceId,
        });

        if (existingMember) {
          const updatedMember: Member = {
            ...existingMember,
            firstName: firstName ?? existingMember.firstName,
            lastName: lastName ?? existingMember.lastName,
            jobTitle: jobTitle ?? existingMember.jobTitle,
            avatarUrl: avatarUrl ?? existingMember.avatarUrl,
            country: country ?? existingMember.country,
            language: language ?? existingMember.language,
            linkedinUrl: linkedinUrl ?? existingMember.linkedinUrl,
            tags: _tags.map((tag) => tag.id),
            companyId: _company?.id ?? existingMember.companyId,
            emails: _emails.filter(Boolean) as string[],
            phones: _phones.filter(Boolean) as string[],
            customFields: [...existingMember.customFields, ...fields],
            updatedAt: new Date(),
          };

          await processProfiles({
            memberId: existingMember.id,
            memberData: member,
            workspaceId,
          });

          updatedMembers.push(updatedMember);
        } else {
          const newMember: Member = {
            id: randomUUID(),
            firstName: firstName ?? "",
            lastName: lastName ?? "",
            avatarUrl: avatarUrl ?? "",
            country: country ?? "",
            language: language ?? "",
            jobTitle: jobTitle ?? "",
            primaryEmail: primaryEmail ?? "",
            emails: _emails.filter(Boolean) as string[],
            phones: _phones.filter(Boolean) as string[],
            tags: _tags.map((tag) => tag.id),
            companyId: _company?.id ?? null,
            linkedinUrl: linkedinUrl ?? "",
            levelNumber: null,
            pulse: 0,
            source: "Manual" as const,
            isStaff: false,
            customFields: fields,
            atRiskMember: false,
            potentialAmbassador: false,
            firstActivity: null,
            lastActivity: null,
            workspaceId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await processProfiles({
            memberId: newMember.id,
            memberData: member,
            workspaceId,
          });

          importedMembers.push(newMember);
        }
      }
    }

    logger.info("importedMembers", { count: importedMembers.length });
    logger.info("updatedMembers", { count: updatedMembers.length });

    if (importedMembers.length > 0) {
      await prisma.member.createMany({
        data: importedMembers,
      });
    }

    if (updatedMembers.length > 0) {
      await prisma.member.createMany({
        data: updatedMembers,
      });
    }

    if (Object.values(mappedColumns).includes("discordId")) {
      logger.info("Processing Discord profiles");
      await processDiscordProfiles({ members, workspaceId });
    }

    if (Object.values(mappedColumns).includes("githubLogin")) {
      logger.info("Processing Github profiles");
      await processGithubProfiles({ members, workspaceId });
    }

    if (Object.values(mappedColumns).includes("slackId")) {
      logger.info("Processing Slack profiles");
      await processSlackProfiles({ members, workspaceId });
    }

    logger.info("success");
  },
  onSuccess: async ({ user }) => {
    const { workspaceId } = user;
    const workspace = await getWorkspace({ id: workspaceId });

    await resend.emails.send({
      from: "Conquest <team@useconquest.com>",
      to: user.email,
      subject: "Members successfully imported",
      react: ImportSuccess({ slug: workspace.slug }),
    });
  },
  onFailure: async ({ user }, error) => {
    const { workspaceId } = user;
    const workspace = await getWorkspace({ id: workspaceId });

    await resend.emails.send({
      from: "Conquest <team@useconquest.com>",
      to: user.email,
      subject: "Members import failed",
      react: ImportFailure({ slug: workspace.slug, error }),
    });
  },
});
