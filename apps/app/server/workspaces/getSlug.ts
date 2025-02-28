import { client } from "@conquest/clickhouse/client";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getSlug = protectedProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { slug } = input;

    const result = await client.query({
      query: `
        SELECT *
        FROM workspaces 
        WHERE slug = '${slug}'
      `,
      format: "JSON",
    });

    const { rows } = await result.json();
    return rows;
  });
