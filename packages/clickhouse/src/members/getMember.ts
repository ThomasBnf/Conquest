import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const getMember = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM member
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return MemberSchema.parse(data[0]);
};
