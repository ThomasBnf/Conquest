import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type Company,
  CompanySchema,
} from "@conquest/zod/schemas/company.schema";
import {
  type Member,
  MemberWithCompanySchema,
} from "@conquest/zod/schemas/member.schema";
import { filteredDomain } from "../../helpers/filteredDomain";
import { idParser } from "../../helpers/idParser";
import { prisma } from "../../lib/prisma";

type Props = {
  id: string;
  data: Omit<Partial<Member>, "id" | "emails" | "phones"> & {
    primary_email?: string;
    phones?: string[];
  };
  source: Source;
  workspace_id: string;
};

export const upsertMember = async ({
  id,
  data,
  source,
  workspace_id,
}: Props) => {
  const { primary_email, phones } = data;

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

    if (id && source === "LIVESTORM") {
      return {
        livestorm_id_workspace_id: {
          livestorm_id: id,
          workspace_id,
        },
      };
    }

    return {
      id,
      workspace_id,
    };
  };

  const member = await prisma.members.upsert({
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
      phones: formattedPhones ?? [],
      company_id: company?.id ?? null,
      source,
      workspace_id,
    },
    include: {
      company: true,
    },
  });

  return MemberWithCompanySchema.parse(member);
};
