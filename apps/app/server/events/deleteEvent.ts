import { deleteEvent as _deleteEvent } from "@conquest/db/events/deleteEvent";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteEvent = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return await _deleteEvent({ id });
  });
