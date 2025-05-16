import { updateMember } from "@conquest/clickhouse/member/updateMember";
import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { NodeTagMember } from "@conquest/zod/schemas/node.schema";

type Props = {
  node: NodeTagMember;
  member: MemberWithLevel;
};

export const removeTags = async ({ node, member }: Props) => {
  const { tags } = node;

  await updateMember({
    ...member,
    tags: member.tags.filter((tag) => !tags.includes(tag)),
    updatedAt: new Date(),
  });
};
