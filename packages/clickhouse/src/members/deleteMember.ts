import { client } from "../client";

type Props = {
  id: string;
};

export const deleteMember = async ({ id }: Props) => {
  await client.query({
    query: `
      DELETE 
      FROM members
      WHERE id = '${id}'
    `,
  });
};
