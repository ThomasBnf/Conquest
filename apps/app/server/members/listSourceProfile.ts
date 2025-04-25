import { client } from "@conquest/clickhouse/client";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { protectedProcedure } from "../trpc";

export const listSourcesProfile = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const result = await client.query({
      query: `
        SELECT DISTINCT toString(attributes.source) as source
        FROM profile FINAL
        WHERE workspaceId = '${workspaceId}'
        ORDER BY source ASC
      `,
    });

    const { data } = (await result.json()) as {
      data: Array<{ source: string }>;
    };

    return SOURCE.array().parse(data.map((row) => row.source));
  },
);
