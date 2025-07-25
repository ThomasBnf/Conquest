import { RunSchema } from "@conquest/zod/schemas/run.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const getRun = async ({ id }: Props) => {
  const run = await prisma.run.findFirst({
    where: {
      id,
    },
  });

  if (!run) return null;
  return RunSchema.parse(run);
};