import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const getCompany = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM company
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return CompanySchema.parse(data[0]);
};
