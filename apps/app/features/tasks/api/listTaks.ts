import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { TaskSchema } from "@conquest/zod/schemas/task.schema";

export const listTaks = protectedProcedure.query(async ({ ctx: { user } }) => {
  const { workspaceId } = user;

  const tasks = await prisma.task.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      dueDate: "desc",
    },
  });

  return TaskSchema.array().parse(tasks);
});
