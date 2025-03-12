import { getEvent as _getEvent } from "@conquest/db/events/getEvent";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getEvent = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    return await _getEvent({ id });
  });
