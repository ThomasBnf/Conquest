import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const getUserById = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM users 
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return UserSchema.parse(data.at(0));
};
