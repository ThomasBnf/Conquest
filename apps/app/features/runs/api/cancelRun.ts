import { prisma } from "@conquest/db/prisma";
import { getRun } from "@conquest/db/runs/getRun";
import { cancelRun as cancelRunTrigger } from "@conquest/trigger/tasks/cancel-run";

type Props = {
  id: string;
};

export const cancelRun = async ({ id }: Props) => {
  const run = await getRun({ id });

  if (!run) {
    throw new Error("Run not found");
  }

  if (run.status !== "RUNNING" && run.status !== "WAITING") {
    throw new Error("Can only cancel running or waiting runs");
  }

  await cancelRunTrigger.trigger({ id });

  return await prisma.run.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
    },
  });
};
