import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
  company_id?: string;
  offset?: number;
  limit?: number;
};

export const listMembers = async ({
  workspace_id,
  company_id,
  offset,
  limit,
}: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM member
      WHERE workspace_id = '${workspace_id}'
      ${company_id ? `AND company_id = '${company_id}'` : ""}
      ${limit ? `LIMIT ${limit}` : ""}
      ${offset ? `OFFSET ${offset}` : ""}
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
