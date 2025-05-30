import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = {
  name: string;
  workspaceId: string;
};

export const getCompanyByName = async ({ name, workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM company
      WHERE name = '${name}'
      AND workspaceId = '${workspaceId}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return null;
  return CompanySchema.parse(data[0]);
};
