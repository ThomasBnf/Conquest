import { prisma } from "@conquest/db/prisma";
import { client } from "../client";

type Props = {
  ids: string[];
};

export const deleteManyMembers = async ({ ids }: Props) => {
  const parsedIds = ids.map((id) => `'${id}'`).join(",");

  await client.query({
    query: `
      ALTER TABLE profile 
      DELETE WHERE memberId IN (${parsedIds})
    `,
  });

  await client.query({
    query: `
      ALTER TABLE activity
      DELETE WHERE memberId IN (${parsedIds})
    `,
  });

  await client.query({
    query: `
      ALTER TABLE member 
      DELETE WHERE id IN (${parsedIds})
    `,
  });

  await prisma.duplicate.deleteMany({
    where: {
      memberIds: {
        hasSome: ids,
      },
    },
  });

  return { success: true };
};
