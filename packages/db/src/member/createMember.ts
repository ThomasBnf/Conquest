import { Source } from "@conquest/zod/enum/source.enum";
import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { createCompany } from "../company/createCompany";
import { getCompanyByDomain } from "../company/getCompanyByDomain";
import { filteredDomain } from "../helpers/filteredDomain";
import { prisma } from "../prisma";

type Props = Partial<Member> & {
  source: Source;
  workspaceId: string;
};

export const createMember = async (props: Props) => {
  const {
    firstName,
    lastName,
    primaryEmail,
    phones,
    source,
    workspaceId,
    updatedAt,
    createdAt,
    ...data
  } = props;

  const formattedEmail = primaryEmail?.toLowerCase().trim();
  const formattedPhones = phones?.map((phone) => phone.toLowerCase().trim());
  const domain = formattedEmail?.split("@")[1];

  let companyId: string | undefined;

  if (domain) {
    let company = await getCompanyByDomain({
      domain: `https://${domain}`,
      workspaceId,
    });

    if (!company) {
      const companyName = filteredDomain(domain);

      if (companyName) {
        company = await createCompany({
          name: companyName,
          domain: `https://${domain}`,
          source,
          workspaceId,
        });
      }
    }

    companyId = company?.id;
  }

  const member = await prisma.member.create({
    data: {
      ...data,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      primaryEmail: formattedEmail ?? "",
      emails: formattedEmail ? [formattedEmail] : [],
      phones: formattedPhones,
      customFields: [],
      source,
      companyId,
      workspaceId,
      ...(createdAt && { createdAt }),
      ...(updatedAt && { updatedAt }),
    },
  });

  return MemberSchema.parse(member);
};
