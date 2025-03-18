import { client } from "../client";

type Props = {
  id: string;
};

export const deleteMember = async ({ id }: Props) => {
  await client.query({
    query: `
      ALTER TABLE member
      DELETE WHERE id = '${id}'
    `,
  });

  await client.query({
    query: `
      ALTER TABLE activity
      DELETE WHERE 
      (invite_to = '${id}' OR member_id = '${id}')
    `,
  });
};
