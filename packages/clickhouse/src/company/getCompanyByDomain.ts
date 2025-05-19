import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = {
  domain: string;
  workspaceId: string;
};

export const getCompanyByDomain = async ({ domain, workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM company
      WHERE domain = '${domain}'
      AND workspaceId = '${workspaceId}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return null;
  return CompanySchema.parse(data[0]);
};
