import { client } from "../client";

type Props = {
  id: string;
  name: string;
  color: string;
};

export const updateTag = async ({ id, name, color }: Props) => {
  await client.query({
    query: `
        ALTER TABLE tags 
        UPDATE    
            name = '${name}',
            color = '${color}',
        WHERE id = '${id}'
    `,
  });
};
