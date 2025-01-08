import { filteredDomain } from "@/features/members/helpers/filteredDomain";
import { idParser } from "@/helpers/idParser";
import { prisma } from "@/lib/prisma";
import {
  type Company,
  CompanySchema,
} from "@conquest/zod/schemas/company.schema";
import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";

type Props = {
  id: string;
  data: Omit<Partial<Member>, "id" | "emails" | "phones" | "deleted_at"> & {
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

      company = CompanySchema.parse(
        await prisma.companies.upsert({
          where: {
            domain: `https://${domain}`,
          },
          update: {
            name: formattedCompanyName,
            domain: `https://${domain}`,
          },
          create: {
            name: formattedCompanyName,
            domain: `https://${domain}`,
            source,
            workspace_id,
          },
        }),
      );
    }
  }

  const parsedId = idParser({ id, source });

  const whereClause = () => {
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

    if (formattedEmail) {
      return {
        primary_email_workspace_id: {
          primary_email: formattedEmail,
          workspace_id,
        },
      };
    }

    return {
      id,
      workspace_id,
    };
  };

  const newMember = await prisma.members.upsert({
    where: whereClause(),
    update: {
      ...data,
      ...parsedId,
      primary_email: formattedEmail ?? null,
      phones: formattedPhones ?? undefined,
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
  });

  return MemberSchema.parse(newMember);
};
