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
  const credits = nodes.filter((node) => node.data.status).length;
  const hasFailed = nodes.some((node) => node.data.status === "FAILED");

  const run = await prisma.run.update({
    where: {
      id,
    },
    data: {
      status,
      runNodes: Array.from(runNodes.values()),
      credits: hasFailed ? 0 : credits,
      completedAt: new Date(),
    },
  });

  return RunSchema.parse(run);
};
