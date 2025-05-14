import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { TaskSchema } from "@conquest/zod/schemas/task.schema";

export const createTask = protectedProcedure
  .input(TaskSchema)
  .mutation(async ({ input }) => {
    console.log(input);
    return await client.insert({
      table: "task",
      values: [input],
      format: "JSON",
    });
  });
