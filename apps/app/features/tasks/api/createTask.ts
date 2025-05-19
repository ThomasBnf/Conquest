import { protectedProcedure } from "@/server/trpc";
import { createTask as _createTask } from "@conquest/db/task/createTask";
import { TaskSchema } from "@conquest/zod/schemas/task.schema";

export const createTask = protectedProcedure
  .input(TaskSchema)
  .mutation(async ({ input }) => {
    return await _createTask(input);
  });
