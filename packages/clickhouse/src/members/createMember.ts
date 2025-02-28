import type { Company } from "@conquest/zod/schemas/company.schema";
import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";
import { createCompany } from "../companies/createCompany";
import { filteredDomain } from "../helpers/filteredDomain";

type Props = Partial<Member>;

export const createMember = async (props: Props) => {
  const id = uuid();

  const { primary_email, phones } = props;

  const formattedEmail = primary_email?.toLowerCase().trim();
  const formattedPhones = phones?.map((phone) => phone.toLowerCase().trim());
  const formattedDomain = formattedEmail?.split("@")[1];

  let company: Company | undefined;

  if (formattedDomain) {
    const { companyName, domain } = filteredDomain(formattedDomain) ?? {};

    if (companyName && domain) {
      const formattedCompanyName =
        companyName.charAt(0).toUpperCase() + companyName.slice(1);
      const formattedDomain = `https://${domain}`;

      company = await createCompany({
        name: formattedCompanyName,
        domain: formattedDomain,
        source: props.source,
        workspace_id: props.workspace_id,
      });
    }
  }

  await client.insert({
    table: "members",
    values: [
      {
        ...props,
        id,
        primary_email: formattedEmail,
        phones: formattedPhones,
        first_activity: null,
        last_activity: null,
        company_id: company?.id,
      },
    ],
    format: "JSON",
  });

  const result = await client.query({
    query: `
        SELECT * 
        FROM members 
        WHERE id = '${id}'`,
  });

  const { data } = await result.json();
  return MemberSchema.parse(data[0]);
};
