import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateManyMembers = protectedProcedure
  .input(
    z.object({
      members: MemberSchema.array(),
    }),
  )
  .mutation(async ({ input }) => {
    const { members } = input;

    await client.insert({
      table: "member",
      values: members,
      format: "JSON",
    });

    await client.query({
      query: "OPTIMIZE TABLE member FINAL;",
    });
  });
