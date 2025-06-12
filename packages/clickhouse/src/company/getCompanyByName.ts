import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = {
  name: string;
  workspaceId: string;
};

export const getCompanyByName = async ({ name, workspaceId }: Props) => {
  const sanitizedName = name.replace(/'/g, "\\'");

  const result = await client.query({
    query: `
      SELECT *
      FROM company FINAL
      WHERE name = '${sanitizedName}'
      AND workspaceId = '${workspaceId}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();

  if (!data.length) return null;
  return CompanySchema.parse(data[0]);
};
