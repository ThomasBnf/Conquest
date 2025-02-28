import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { client } from "../client";

type Props = {
  email: string;
};

export const getUser = async ({ email }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM users 
      WHERE email = '${email}'  
    `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return UserSchema.parse(data.at(0));
};
