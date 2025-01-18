import { filteredDomain } from "@/features/members/helpers/filteredDomain";
import { idParser } from "@/helpers/idParser";
import { prisma } from "@/lib/prisma";
import {
  type Company,
  CompanySchema,
} from "@conquest/zod/schemas/company.schema";
import {
  type Member,
  MemberWithCompanySchema,
} from "@conquest/zod/schemas/member.schema";
import cuid from "cuid";
import { getMember } from "./getMember";
import { mergeMembers } from "./mergeMembers";

type Props = {
  id: string;
  data: Omit<Partial<Member>, "id" | "emails" | "phones"> & {
    primary_email?: string;
    phones?: string[];
  };
};

export const upsertMember = async (props: Props) => {
  const { id, data } = props;
  const { primary_email, phones, source, workspace_id } = data;

  if (!source) throw new Error("Source is required");
  if (!workspace_id) throw new Error("Workspace ID is required");

  const formattedEmail = primary_email?.toLowerCase().trim();
  const formattedPhones = phones?.map((phone) => phone.toLowerCase().trim());
  const formattedDomain = formattedEmail?.split("@")[1];

  let company: Company | null = null;

  if (formattedDomain) {
    const { companyName, domain } = filteredDomain(formattedDomain) ?? {};

    if (companyName && domain) {
      const formattedCompanyName =
        companyName.charAt(0).toUpperCase() + companyName.slice(1);
      const formattedDomain = `https://${domain}`;

      company = CompanySchema.parse(
        await prisma.companies.upsert({
          where: {
            domain: formattedDomain,
          },
          update: {
            name: formattedCompanyName,
            domain: formattedDomain,
          },
          create: {
            name: formattedCompanyName,
            domain: formattedDomain,
            source,
            workspace_id,
          },
        }),
      );
    }
  }

  const parsedId = idParser({ id, source });

  const whereClause = () => {
    if (id && source === "SLACK") {
      return {
        slack_id_workspace_id: {
          slack_id: id,
          workspace_id,
        },
      };
    }

    if (id && source === "DISCORD") {
      return {
        discord_id_workspace_id: {
          discord_id: id,
          workspace_id,
        },
      };
    }

    if (id && source === "LINKEDIN") {
      return {
        linkedin_id_workspace_id: {
          linkedin_id: id,
          workspace_id,
        },
      };
    }

    return {
      id,
      workspace_id,
    };
  };

  if (formattedEmail) {
    const existingMember = await getMember({
      email: formattedEmail,
      workspace_id,
    });

    if (existingMember && existingMember.source !== source) {
      const newMember = MemberWithCompanySchema.parse(
        await prisma.members.create({
          data: {
            ...data,
            ...parsedId,
            primary_email: `${cuid()}@mail.com`,
            phones: formattedPhones ?? [],
            company_id: company?.id ?? null,
            source,
            workspace_id,
          },
          include: {
            company: true,
          },
        }),
      );

      return await mergeMembers({
        leftMember: newMember,
        rightMember: existingMember,
      });
    }
  }

  const newMember = await prisma.members.upsert({
    where: whereClause(),
    update: {
      ...data,
      ...parsedId,
      primary_email: formattedEmail ?? null,
      phones: formattedPhones ?? [],
      company_id: company?.id ?? null,
      source,
    },
    create: {
      ...data,
      ...parsedId,
      primary_email: formattedEmail ?? null,
      phones: formattedPhones ?? undefined,
      company_id: company?.id ?? null,
      source,
      workspace_id,
    },
    include: {
      company: true,
    },
  });

  return MemberWithCompanySchema.parse(newMember);
};
