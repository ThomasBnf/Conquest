import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
  memberId: string;
  workflowId: string;
};

export const createRun = async ({ id, memberId, workflowId }: Props) => {
  const run = await prisma.run.create({
    data: {
      id,
      memberId,
      workflowId,
    },
  });

  return RunSchema.parse(run);
};
