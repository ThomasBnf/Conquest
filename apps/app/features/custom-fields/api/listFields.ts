import { protectedProcedure } from "@/server/trpc";
import { listFields as _listFields } from "@conquest/db/custom-fields/listFields";
import { RECORD } from "@conquest/zod/enum/record.enum";
import { z } from "zod";

export const listFields = protectedProcedure
  .input(
    z.object({
      record: RECORD,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { record } = input;

    return await _listFields({ workspaceId, record });
  });
