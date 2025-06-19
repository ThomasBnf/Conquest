import { FormLevelSchema } from "@/features/levels/schema/form.schema";
import { createLevel as _createLevel } from "@conquest/db/level/createLevel";
import { protectedProcedure } from "../trpc";

export const createLevel = protectedProcedure
  .input(FormLevelSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { name, number, from, to } = input;

    return _createLevel({ name, number, from, to, workspaceId });
  });
