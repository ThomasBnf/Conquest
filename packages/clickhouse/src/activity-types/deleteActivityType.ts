import { client } from "../client";

type Props = {
  id: string;
};

export const deleteActivityType = async ({ id }: Props) => {
  return await client.query({
    query: `
        DELETE 
        FROM activity_types 
        WHERE id = '${id}'`,
  });
};
