import { FormTagSchema } from "@/features/tags/schema/form.schema";
import { updateTag as _updateTag } from "@conquest/clickhouse/tags/updateTag";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateTag = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: FormTagSchema,
    }),
  )
  .mutation(async ({ input }) => {
    const { id, data } = input;

    return _updateTag({ id, ...data });
  });
