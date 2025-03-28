import { client } from "@conquest/clickhouse/client";
import { protectedProcedure } from "../trpc";

export const listLanguages = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const result = await client.query({
      query: `
        SELECT DISTINCT language
        FROM member
        WHERE 
          workspace_id = '${workspace_id}'
          AND language IS NOT NULL; 
      `,
    });

    const { data } = (await result.json()) as {
      data: Array<{ language: string }>;
    };

    return data.filter((row) => row.language !== "").map((row) => row.language);
  },
);
