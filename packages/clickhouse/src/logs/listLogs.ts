import { LogSchema } from "@conquest/zod/schemas/logs.schema";
import { client } from "../client";

type Props = {
  member_id: string;
};

export const listLogs = async ({ member_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM log
      WHERE member_id = '${member_id}'
      ORDER BY date ASC
    `,
  });

  const { data } = await result.json();
  return LogSchema.array().parse(data);
};
