import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  workspaceId?: string;
};

export const listAllMembers = async ({ workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM member FINAL
      ${workspaceId ? `WHERE workspaceId = '${workspaceId}'` : ""}
      ORDER BY createdAt DESC
    `,
  });

  const { data } = await result.json();
  return MemberSchema.array().parse(data);
};
