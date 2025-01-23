import { filteredDomain } from "@/features/members/helpers/filteredDomain";
import { prisma } from "@/lib/prisma";
import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type Company,
  CompanySchema,
} from "@conquest/zod/schemas/company.schema";
import {
  type Member,
  MemberWithCompanySchema,
} from "@conquest/zod/schemas/member.schema";

type Props = {
  data: Partial<Member>;
  source: Source;
  workspace_id: string;
};

export const createMember = async ({ data, source, workspace_id }: Props) => {
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
          update: {},
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

  const member = await prisma.members.create({
    data: {
      ...data,
      company_id: company?.id,
      primary_email: formattedEmail,
      phones: formattedPhones,
      source,
      workspace_id,
    },
    include: {
      company: true,
    },
  });

  return MemberWithCompanySchema.parse(member);
};
