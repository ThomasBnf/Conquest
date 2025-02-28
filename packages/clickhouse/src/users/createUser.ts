import type { User } from "@conquest/zod/schemas/user.schema";
import { client } from "../client";

type Props = Partial<User>;

export const createUser = async (props: Props) => {
  return await client.insert({
    table: "users",
    values: props,
    format: "JSON",
  });
};
