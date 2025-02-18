import type { Source } from "@conquest/zod/enum/source.enum";
import {
  type Company,
  CompanySchema,
} from "@conquest/zod/schemas/company.schema";
import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { filteredDomain } from "../../helpers/filteredDomain";
import { idParser } from "../../helpers/idParser";
import { prisma } from "../../prisma";

type Props = {
  id: string;
  data: Omit<Partial<Member>, "id" | "emails" | "phones" | "profiles"> & {
    primary_email?: string | null;
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
        await prisma.company.upsert({
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

  const existingProfile = await prisma.profile.findUnique({
    where: {
      id,
    },
  });

  const member = await prisma.member.upsert({
    where: { id: existingProfile?.member_id },
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

  return MemberSchema.parse(member);
};
