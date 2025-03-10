import { client } from "@conquest/clickhouse/client";
import { protectedProcedure } from "../trpc";

export const listCountries = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const result = await client.query({
      query: `
        SELECT DISTINCT country
        FROM member
        WHERE workspace_id = '${workspace_id}'
        AND country IS NOT NULL; 
      `,
    });

    const { data } = (await result.json()) as {
      data: Array<{ country: string }>;
    };

    return data.filter((row) => row.country !== "").map((row) => row.country);
  },
);
