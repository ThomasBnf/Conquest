import { client } from "../client";

type Props = {
  id: string;
};

export const deleteActivityType = async ({ id }: Props) => {
  return await client.query({
    query: `
      ALTER TABLE activityType
      DELETE WHERE id = '${id}'`,
  });
};
