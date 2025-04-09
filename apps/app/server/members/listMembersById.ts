import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listMembersById = protectedProcedure
  .input(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .query(async ({ input, ctx: { user } }) => {
    const { ids } = input;
    const { workspace_id } = user;

    const result = await client.query({
      query: `
        SELECT * FROM member FINAL
        WHERE id IN (${ids.map((id) => `'${id}'`).join(",")}) 
        AND workspace_id = '${workspace_id}'
      `,
    });

    const { data } = await result.json();
    return MemberSchema.array().parse(data);
  });
