import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { prisma } from "../prisma";

type Props = {
  memberId: string;
  runId: string;
  workflowId: string;
};

export const createRun = async ({ memberId, runId, workflowId }: Props) => {
  const run = await prisma.run.create({
    data: {
      memberId,
      runId,
      workflowId,
    },
  });

  return RunSchema.parse(run);
};
