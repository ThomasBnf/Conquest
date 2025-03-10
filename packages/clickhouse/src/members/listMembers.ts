import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
  company_id?: string;
};

export const listMembers = async ({ workspace_id, company_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM member
      WHERE workspace_id = '${workspace_id}'
      ${company_id ? `AND company_id = '${company_id}'` : ""}
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
