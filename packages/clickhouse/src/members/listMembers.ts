import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  workspaceId: string;
  companyId?: string;
  offset?: number;
  limit?: number;
};

export const listMembers = async ({
  workspaceId,
  companyId,
  offset,
  limit,
}: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM member FINAL
      WHERE workspaceId = '${workspaceId}'
      ${companyId ? `AND companyId = '${companyId}'` : ""}
      ${limit ? `LIMIT ${limit}` : ""}
      ${offset ? `OFFSET ${offset}` : ""}
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
