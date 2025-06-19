import { LogSchema } from "@conquest/zod/schemas/logs.schema";
import { prisma } from "../prisma";

type Props = {
  memberId: string;
};

export const listLogs = async ({ memberId }: Props) => {
  const logs = await prisma.log.findMany({
    where: {
      memberId,
    },
    orderBy: {
      date: "desc",
    },
  });

  return LogSchema.array().parse(logs);
};
