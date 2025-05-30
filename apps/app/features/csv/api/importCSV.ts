import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { getMember } from "@conquest/clickhouse/member/getMember";
import { Member } from "@conquest/zod/schemas/member.schema";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getMemberByExternalId } from "../helpers/getMemberByExternalId";
import { processCompanies } from "../helpers/processCompanies";
import { processProfiles } from "../helpers/processProfiles";
import { processTags } from "../helpers/processTags";
import { csvInfoSchema } from "../schemas/csv-info.schema";

export const importCSV = protectedProcedure
  .input(
    z.object({
      csvInfo: csvInfoSchema,
      mappedColumns: z.record(z.string(), z.string()),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { csvInfo, mappedColumns } = input;
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
            updatedAt: new Date(),
          };

          await processProfiles({
            memberId: existingMember.id,
            memberData: member,
            workspaceId,
          });

          updatedMembers.push(updatedMember);
        } else {
          const newMemberId = randomUUID();

          const newMember = {
            id: newMemberId,
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
            levelId: null,
            pulse: 0,
            source: "Manual" as const,
            isStaff: false,
            customFields: { fields: [] },
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

    console.log("importedMembers", importedMembers.length);
    console.log("updatedMembers", updatedMembers.length);

    if (importedMembers.length > 0) {
      await client.insert({
        table: "member",
        values: importedMembers,
        format: "JSON",
      });
    }

    if (updatedMembers.length > 0) {
      await client.insert({
        table: "member",
        values: updatedMembers,
        format: "JSON",
      });
    }

    console.log("success");

    return { success: true };
  });
