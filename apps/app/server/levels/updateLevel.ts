import { FormLevelSchema } from "@/features/levels/schema/form.schema";
import { updateLevel as _updateLevel } from "@conquest/db/level/updateLevel";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateLevel = protectedProcedure
  .input(
    z.object({
      number: z.number(),
      data: FormLevelSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { number, data } = input;
    const { name, from, to } = data;

    return _updateLevel({ number, name, from, to, workspaceId });
  });
