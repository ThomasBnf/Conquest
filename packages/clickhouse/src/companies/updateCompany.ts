import type { Company } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = Company;

export const updateCompany = async (props: Props) => {
  const { id, workspaceId, updatedAt, ...data } = props;
  const values = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE company
      UPDATE ${values}, updatedAt = now()
      WHERE id = '${id}'
    `,
  });
};
