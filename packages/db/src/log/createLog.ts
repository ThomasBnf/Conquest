import type { Log } from "@conquest/zod/schemas/logs.schema";
import { prisma } from "../prisma";

type Props = {
  log: Omit<Log, "id">;
};

export const createLog = async ({ log }: Props) => {
  await prisma.log.create({
    data: {
      ...log,
    },
  });
};
