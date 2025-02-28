import { client } from "../client";

type Props = {
  ids: string[];
};

export const deleteManyMembers = async ({ ids }: Props) => {
  const parsedIds = ids.map((id) => `'${id}'`).join(",");

  return await client.query({
    query: `
      DELETE FROM members
      WHERE id IN (${parsedIds})
    `,
  });
};
