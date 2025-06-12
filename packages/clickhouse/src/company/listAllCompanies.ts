import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = {
  workspaceId?: string;
};

export const listAllCompanies = async ({ workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM company FINAL
      ${workspaceId ? `WHERE workspaceId = '${workspaceId}'` : ""}
      ORDER BY createdAt DESC
    `,
  });

  const { data } = await result.json();
  return CompanySchema.array().parse(data);
};
