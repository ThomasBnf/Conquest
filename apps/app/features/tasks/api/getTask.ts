import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { TaskSchema } from "@conquest/zod/schemas/task.schema";
import { z } from "zod";

export const getTask = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    const result = await client.query({
      query: `
      SELECT * 
      FROM task
      WHERE id = '${id}'
    `,
    });

    const { data } = await result.json();
    return TaskSchema.array().parse(data);
  });
