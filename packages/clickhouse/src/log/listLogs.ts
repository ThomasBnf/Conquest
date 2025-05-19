import { LogSchema } from "@conquest/zod/schemas/logs.schema";
import { client } from "../client";

type Props = {
  memberId: string;
};

export const listLogs = async ({ memberId }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM log
      WHERE memberId = '${memberId}'
      ORDER BY date ASC
    `,
  });

  const { data } = await result.json();
  return LogSchema.array().parse(data);
};
