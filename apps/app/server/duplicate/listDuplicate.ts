import { listDuplicates as _listDuplicates } from "@conquest/db/duplicates/listDuplicates";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listDuplicate = protectedProcedure
  .input(
    z.object({
      cursor: z.number().nullish(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { workspaceId } = ctx.user;
    const { cursor } = input;

    return _listDuplicates({ cursor, workspaceId });
  });
