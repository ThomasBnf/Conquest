import { client } from "../client";

type Props = {
  id: string;
};

export const deleteEvent = async ({ id }: Props) => {
  await client.query({
    query: `
      DELETE 
      FROM events 
      WHERE id = '${id}'
    `,
  });
};
