import { Node, NodeWaitSchema } from "@conquest/zod/schemas/node.schema";
import { wait } from "@trigger.dev/sdk/v3";
import { nodeStatus } from "./nodeStatus";

type Props = {
  node: Node;
};

const TIME_UNITS = {
  seconds: 1,
  minutes: 60,
  hours: 60 * 60,
  days: 24 * 60 * 60,
} as const;

export const waitFor = async ({ node }: Props): Promise<Node> => {
  const parsedNode = NodeWaitSchema.parse(node.data);
  const { duration, unit } = parsedNode;

  const seconds = duration * TIME_UNITS[unit];
  await wait.for({ seconds });

  return nodeStatus({ node, status: "COMPLETED" });
};
