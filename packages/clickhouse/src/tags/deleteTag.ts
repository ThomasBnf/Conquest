import { client } from "../client";

type Props = {
  id: string;
};

export const deleteTag = async ({ id }: Props) => {
  await client.query({
    query: `
      DELETE 
      FROM lists
      WHERE id = '${id}'
    `,
  });
};
