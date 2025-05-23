import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { prisma } from "../prisma";

type Props = {
  workflowId: string;
};

export const createRun = async ({ workflowId }: Props) => {
  const run = await prisma.run.create({
    data: {
      workflowId,
    },
  });

  return RunSchema.parse(run);
};
