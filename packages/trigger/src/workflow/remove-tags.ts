import { updateMember } from "@conquest/db/member/updateMember";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Node, NodeTagMemberSchema } from "@conquest/zod/schemas/node.schema";
import { nodeStatus } from "./nodeStatus";

type Props = {
  node: Node;
  member: Member;
};

export const removeTags = async ({ node, member }: Props): Promise<Node> => {
  const parsedNode = NodeTagMemberSchema.parse(node.data);
  const { tags } = parsedNode;

  try {
    await updateMember({
      ...member,
      tags: member.tags.filter((tag) => !tags.includes(tag)),
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
