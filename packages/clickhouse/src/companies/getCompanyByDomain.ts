import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = {
  domain: string;
};

export const getCompanyByDomain = async ({ domain }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM company
      WHERE domain = '${domain}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return null;
  return CompanySchema.parse(data[0]);
};
