import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { TaskSchema } from "@conquest/zod/schemas/task.schema";

export const listTaks = protectedProcedure.query(async ({ ctx: { user } }) => {
  const { workspaceId } = user;

  const result = await client.query({
    query: `
      SELECT * 
      FROM task FINAL
      WHERE workspaceId = '${workspaceId}'
      ORDER BY createdAt DESC
    `,
  });

  const { data } = await result.json();
  return TaskSchema.array().parse(data);
});
