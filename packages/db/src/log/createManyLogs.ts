import type { Log } from "@conquest/zod/schemas/logs.schema";
import { prisma } from "../prisma";

type Props = {
  logs: Log[];
};

export const createManyLogs = async ({ logs }: Props) => {
  await prisma.log.createMany({
    data: logs,
  });
};
