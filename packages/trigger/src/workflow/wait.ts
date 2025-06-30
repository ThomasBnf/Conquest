import { prisma } from "@conquest/db/prisma";
import { updateRun } from "@conquest/db/runs/updateRun";
import { Node, NodeWaitSchema } from "@conquest/zod/schemas/node.schema";
import { Run } from "@conquest/zod/schemas/run.schema";
import { wait } from "@trigger.dev/sdk/v3";
import { nodeStatus } from "./nodeStatus";

type Props = {
  run: Run;
  node: Node;
  runNodes: Map<string, Node>;
};

const TIME_UNITS = {
  seconds: 1,
  minutes: 60,
  hours: 60 * 60,
  days: 24 * 60 * 60,
} as const;

export const waitFor = async ({
  run,
  node,
  runNodes,
}: Props): Promise<Node> => {
  const parsedNode = NodeWaitSchema.parse(node.data);
  const { duration, unit } = parsedNode;

  const nodes = new Map([
    ...runNodes,
    [
      node.id,
      {
        ...node,
        data: { ...parsedNode, status: "WAITING" },
      },
    ],
  ]);

  await updateRun({ id: run.id, status: "WAITING", runNodes: nodes });

  const seconds = duration * TIME_UNITS[unit];
  await prisma.$disconnect();

  await wait.for({ seconds });

  return nodeStatus({ node, status: "COMPLETED" });
};
