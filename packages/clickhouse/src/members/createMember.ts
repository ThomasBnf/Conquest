import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";
import { createCompany } from "../companies/createCompany";
import { getCompanyByDomain } from "../companies/getCompanyByDomain";
import { filteredDomain } from "../helpers/filteredDomain";

type Props = Partial<Member> & {
  workspaceId: string;
};

export const createMember = async (props: Props) => {
  const id = uuid();

  const { primaryEmail, phones, source, workspaceId, updatedAt, createdAt } =
    props;

  const formattedEmail = primaryEmail?.toLowerCase().trim();
  const formattedPhones = phones?.map((phone) => phone.toLowerCase().trim());
  const domain = formattedEmail?.split("@")[1];

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

  await client.insert({
    table: "member",
    values: [
      {
        ...props,
        id,
        primaryEmail: formattedEmail,
        emails: formattedEmail ? [formattedEmail] : [],
        phones: formattedPhones,
        firstActivity: null,
        lastActivity: null,
        companyId: company?.id,
        updatedAt: updatedAt ?? new Date(),
        createdAt: createdAt ?? new Date(),
      },
    ],
    format: "JSON",
  });

  const result = await client.query({
    query: `
      SELECT * 
      FROM member FINAL
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();
  return MemberSchema.parse(data[0]);
};
