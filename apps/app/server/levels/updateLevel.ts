import { FormLevelSchema } from "@/features/levels/schema/form.schema";
import { updateLevel as _updateLevel } from "@conquest/clickhouse/levels/updateLevel";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateLevel = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      data: FormLevelSchema,
    }),
  )
  .mutation(async ({ input }) => {
    const { id, data } = input;
    const { name, number, from, to } = data;

    return _updateLevel({ id, name, number, from, to });
  });
