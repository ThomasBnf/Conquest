import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";
import { Node, NodeWebhookSchema } from "@conquest/zod/schemas/node.schema";
import { replaceVariables } from "./replace-variables";

import { nodeStatus } from "./nodeStatus";

type Props = {
  node: Node;
  member: MemberWithLevel;
};

export const webhook = async ({ node, member }: Props): Promise<Node> => {
  const parsedNode = NodeWebhookSchema.parse(node.data);
  const { url, body } = parsedNode;

  if (!url) {
    return nodeStatus({
      node,
      status: "FAILED",
      error: "Please provide a valid URL to send the webhook request",
    });
  }

  const parsedBody = await replaceVariables({ message: body, member });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: parsedBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    return nodeStatus({ node, status: "COMPLETED" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return nodeStatus({
      node,
      status: "FAILED",
      error: `Webhook request failed: ${errorMessage}`,
    });
  }
};
