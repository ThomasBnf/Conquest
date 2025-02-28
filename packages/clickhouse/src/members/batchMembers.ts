import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  limit: number;
  offset: number;
};

export const batchMembers = async ({ limit, offset }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM members
      ORDER BY id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
