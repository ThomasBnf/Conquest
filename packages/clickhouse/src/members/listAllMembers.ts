import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

export const listAllMembers = async () => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM member
      ORDER BY created_at DESC
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
