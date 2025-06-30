import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { prisma } from "../prisma";

type Props = {
  memberId: string;
  workflowId: string;
};

export const createRun = async ({ memberId, workflowId }: Props) => {
  const run = await prisma.run.create({
    data: {
      memberId,
      workflowId,
    },
  });

  return RunSchema.parse(run);
};
