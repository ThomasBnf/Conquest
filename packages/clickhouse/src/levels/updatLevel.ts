import { client } from "../client";

type Props = {
  id: string;
  name: string;
  number: number;
  from: number;
  to?: number;
};

export const updateLevel = async ({ id, name, number, from, to }: Props) => {
  await client.query({
    query: `
        ALTER TABLE levels 
        UPDATE 
            name = '${name}',
            number = ${number},
            from = ${from},
            to = ${to}
        WHERE id = '${id}'
    `,
  });
};
