import { updateList as _updateList } from "@conquest/db/lists/updateList";
import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateList = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      emoji: z.string().optional(),
      groupFilters: GroupFiltersSchema.optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id, ...data } = input;

    return _updateList({ id, ...data });
  });
