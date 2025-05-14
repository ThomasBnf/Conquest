import { prisma } from "@conquest/db/prisma";
import { client } from "../client";

type Props = {
  id: string;
};

export const deleteMember = async ({ id }: Props) => {
  await client.query({
    query: `
      ALTER TABLE profile
      DELETE WHERE memberId = '${id}'
    `,
  });

  await client.query({
    query: `
      ALTER TABLE activity
      DELETE WHERE 
      (inviteTo = '${id}' OR memberId = '${id}')
    `,
  });

  await client.query({
    query: `
      ALTER TABLE member
      DELETE WHERE id = '${id}'
    `,
  });

  await prisma.duplicate.deleteMany({
    where: {
      memberIds: {
        has: id,
      },
    },
  });
};
