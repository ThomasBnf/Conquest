import { Node } from "@conquest/zod/schemas/node.schema";
import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { RUN_STATUS, prisma } from "../prisma";

type Props = {
  id: string;
  status: RUN_STATUS;
  runNodes: Map<string, Node>;
};

export const updateRun = async ({ id, status, runNodes }: Props) => {
  const nodes = Array.from(runNodes.values());

  const failed = status === "FAILED";
  const credits = nodes.filter((node) => {
    if (node.data.type === "wait") return false;
    if ("isTrigger" in node.data) return false;
    return true;
  }).length;

  const run = await prisma.run.update({
    where: {
      id,
    },
    data: {
      status,
      runNodes: Array.from(runNodes.values()),
      credits: failed ? 0 : credits,
      completedAt: new Date(),
    },
  });

  return RunSchema.parse(run);
};
