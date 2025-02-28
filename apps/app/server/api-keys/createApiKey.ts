import { FormCreateSchema } from "@/features/api-keys/schema/form-create.schema";
import { createApiKey as _createApiKey } from "@conquest/clickhouse/api-keys/createApiKey";
import { protectedProcedure } from "../trpc";

export const createApiKey = protectedProcedure
  .input(FormCreateSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { name } = input;
    const { workspace_id } = user;

    return await _createApiKey({ name, workspace_id });
  });
