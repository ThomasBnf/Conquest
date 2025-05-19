import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const getMember = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM member FINAL
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();
  const member = data[0];

  if (!member) return null;
  return MemberSchema.parse(member);
};
