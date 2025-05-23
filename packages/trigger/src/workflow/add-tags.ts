import { updateMember } from "@conquest/clickhouse/member/updateMember";
import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { Node, NodeTagMemberSchema } from "@conquest/zod/schemas/node.schema";
import { nodeStatus } from "./nodeStatus";

type Props = {
  node: Node;
  member: MemberWithLevel;
};

export const addTags = async ({ node, member }: Props): Promise<Node> => {
  const parsedNode = NodeTagMemberSchema.parse(node.data);
  const { tags } = parsedNode;

  try {
    await updateMember({
      ...member,
      tags: [...new Set([...member.tags, ...tags])],
      updatedAt: new Date(),
    });

    return nodeStatus({ node, status: "COMPLETED" });
  } catch (error) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
