import { client } from "@conquest/clickhouse/client";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { protectedProcedure } from "../trpc";

export const listSourcesMember = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const result = await client.query({
      query: `
        SELECT DISTINCT source
        FROM member
        WHERE workspace_id = '${workspace_id}'
        AND deleted_at IS NULL
        ORDER BY source ASC
      `,
    });

    const { data } = (await result.json()) as {
      data: Array<{ source: string }>;
    };

    return SOURCE.array().parse(data.map((row) => row.source));
  },
);
