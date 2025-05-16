import { updateMember } from "@conquest/clickhouse/member/updateMember";
import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { NodeTagMember } from "@conquest/zod/schemas/node.schema";

type Props = {
  node: NodeTagMember;
  member: MemberWithLevel;
};

export const addTags = async ({ node, member }: Props) => {
  const { tags } = node;

  await updateMember({
    ...member,
    tags: [...member.tags, ...tags],
    updatedAt: new Date(),
  });
};
