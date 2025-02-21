import { prisma } from "@conquest/db/prisma";
import { EventSchema } from "@conquest/zod/schemas/event.schema";
import { protectedProcedure } from "../trpc";

export const listEvents = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const events = await prisma.event.findMany({
      where: {
        workspace_id,
      },
    });

    return EventSchema.array().parse(events);
  },
);
