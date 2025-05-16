import { listMembers } from "@conquest/clickhouse/member/listMembers";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listCompanyMembers = protectedProcedure
  .input(
    z.object({
      companyId: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { companyId } = input;

    return await listMembers({
      workspaceId,
      companyId,
    });
  });
