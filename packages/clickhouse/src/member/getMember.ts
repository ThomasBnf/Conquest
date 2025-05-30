import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props =
  | {
      id: string;
    }
  | {
      primaryEmail: string;
      workspaceId: string;
    };

export const getMember = async (props: Props) => {
  const query =
    "primaryEmail" in props
      ? `
      SELECT * 
      FROM member FINAL
      WHERE primaryEmail = '${props.primaryEmail}'
      AND workspaceId = '${props.workspaceId}'
    `
      : `
      SELECT * 
      FROM member FINAL
      WHERE id = '${props.id}'
    `;

  const result = await client.query({ query });
  const { data } = await result.json();
  const member = data[0];

  if (!member) return null;
  return MemberSchema.parse(member);
};
