import { client } from "@conquest/clickhouse/client";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { protectedProcedure } from "../trpc";

export const listSources = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const result = await client.query({
      query: `
        SELECT DISTINCT source
        FROM activity_type
        WHERE workspace_id = '${workspace_id}'
      `,
    });

    const { data } = await result.json();
    return SOURCE.array().parse(
      (data as Array<{ source: string }>).map((row) => row.source),
    );
  },
);
