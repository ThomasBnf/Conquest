import { LogSchema } from "@conquest/zod/schemas/logs.schema";
import { client } from "../client";

type Props = {
  memberId: string;
};

export const listMemberLogs = async ({ memberId }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM log
      WHERE memberId = '${memberId}'
    `,
  });

  const { data } = await result.json();
  return LogSchema.array().parse(data);
};
