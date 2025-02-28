import { client } from "../client";

type Props = {
  id: string;
};

export const deleteLevel = async ({ id }: Props) => {
  await client.query({
    query: `
      DELETE 
      FROM levels
      WHERE id = '${id}'
    `,
  });
};
