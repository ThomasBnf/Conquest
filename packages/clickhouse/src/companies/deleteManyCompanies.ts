import { client } from "../client";

type Props = {
  ids: string[];
};

export const deleteManyCompanies = async ({ ids }: Props) => {
  const parsedIds = ids.map((id) => `'${id}'`).join(",");

  return await client.query({
    query: `
      DELETE FROM companies
      WHERE id IN (${parsedIds})
    `,
  });
};
