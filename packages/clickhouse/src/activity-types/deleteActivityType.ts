import { client } from "../client";

type Props = {
  id: string;
};

export const deleteActivityType = async ({ id }: Props) => {
  return await client.query({
    query: `
      ALTER TABLE activity_type
      DELETE WHERE id = '${id}'`,
  });
};
