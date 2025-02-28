import { client } from "../client";

type Props = {
  id: string;
  emoji: string;
  name: string;
};

export const updateList = async ({ id, emoji, name }: Props) => {
  await client.query({
    query: `
        ALTER TABLE lists 
        UPDATE    
            name = '${name}',
            emoji = '${emoji}',
        WHERE id = '${id}'
    `,
  });
};
