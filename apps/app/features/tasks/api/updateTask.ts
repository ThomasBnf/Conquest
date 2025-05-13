import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { TaskSchema } from "@conquest/zod/schemas/task.schema";
import { z } from "zod";

export const updateTask = protectedProcedure
  .input(
    TaskSchema.partial().extend({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return await client.insert({
      table: "taks",
      values: [
        {
          ...input,
          updatedAt: new Date(),
        },
      ],
      format: "JSON",
    });
  });
