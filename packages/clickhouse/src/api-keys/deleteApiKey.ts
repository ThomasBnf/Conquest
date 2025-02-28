import { client } from "../client";

type Props = {
  id: string;
};

export const deleteApiKey = async ({ id }: Props) => {
  return await client.query({
    query: `
      DELETE 
      FROM api_keys 
      WHERE id = '${id}'`,
  });
};
