import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getAllMembers = protectedProcedure
  .input(
    z.object({
      search: z.string(),
      cursor: z.string().nullish(),
      take: z.number(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { search, cursor, take } = input;

    const result = await client.query({
      query: `
        SELECT *
        FROM member
        WHERE (
          lower(first_name) LIKE lower('%${search}%')
          OR lower(last_name) LIKE lower('%${search}%')
          OR lower(primary_email) LIKE lower('%${search}%')
        )
        AND workspace_id = '${workspace_id}'
        ${cursor ? `AND id > '${cursor}'` : ""}
        ORDER BY first_name ASC
        LIMIT ${take}
    `,
    });

    const { data } = await result.json();
    return MemberSchema.array().parse(data);
  });
