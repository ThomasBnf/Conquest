import { FormListSchema } from "@/features/lists/schemas/form-create.schema";
import { createList as _createList } from "@conquest/clickhouse/lists/createList";
import { protectedProcedure } from "../trpc";

export const createList = protectedProcedure
  .input(FormListSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

    return _createList({ ...input, workspace_id });
  });
