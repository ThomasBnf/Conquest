import type { User } from "@conquest/zod/schemas/user.schema";
import { format } from "date-fns";
import { client } from "../client";

type Props = {
  id: string;
  data: Omit<Partial<User>, "updated_at">;
};

export const updateUser = async ({ id, data }: Props) => {
  const values = Object.entries(data)
    .map(([key, value]) => {
      if (["members_preferences", "companies_preferences"].includes(key)) {
        return `${key} = '${JSON.stringify(value)}'`;
      }
      if (value instanceof Date) {
        const formattedDate = format(value, "yyyy-MM-dd HH:mm:ss");
        return `${key} = '${formattedDate}'`;
      }
      return `${key} = '${value}'`;
    })
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE users
      UPDATE 
         preferences = ${values},
         updated_at = now()
      WHERE id = '${id}'
    `,
  });
};
