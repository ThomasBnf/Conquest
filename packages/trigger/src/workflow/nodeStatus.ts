import { Node } from "@conquest/zod/schemas/node.schema";
import { logger } from "@trigger.dev/sdk/v3";

type Props = {
  node: Node;
  status: "RUNNING" | "WAITING" | "COMPLETED" | "FAILED";
  error?: string;
};

export const nodeStatus = ({ node, status, error }: Props): Node => {
  if (status === "FAILED") {
    logger.warn("Node FAILED", { node, error });
  } else {
    logger.info("Node COMPLETED", { node });
  }

  return {
    ...node,
    data: {
      ...node.data,
      status,
      ...(error && { error }),
    },
  };
};
