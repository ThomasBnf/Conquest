import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";
import { createCompany } from "../companies/createCompany";
import { getCompanyByDomain } from "../companies/getCompanyByDomain";
import { filteredDomain } from "../helpers/filteredDomain";

type Props = Partial<Member>;

export const createMember = async (props: Props) => {
  const id = uuid();

  const { primary_email, phones, source, workspace_id } = props;

  const formattedEmail = primary_email?.toLowerCase().trim();
  const formattedPhones = phones?.map((phone) => phone.toLowerCase().trim());
  const domain = formattedEmail?.split("@")[1];

  let company = await getCompanyByDomain({ domain: `https://${domain}` });

  if (!company) {
    const companyName = filteredDomain(domain);

    if (companyName) {
      company = await createCompany({
        name: companyName,
        domain: `https://${domain}`,
        source,
        workspace_id,
      });
    }
  }

  await client.insert({
    table: "member",
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
        FROM member FINAL
        WHERE id = '${id}'`,
  });

  const { data } = await result.json();
  return MemberSchema.parse(data[0]);
};
