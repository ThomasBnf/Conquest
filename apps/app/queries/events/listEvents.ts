import { prisma } from "@/lib/prisma";
import type { Source } from "@conquest/zod/enum/source.enum";
import { EventSchema } from "@conquest/zod/schemas/event.schema";

type Props = {
  source: Source;
};

export const listEvents = async ({ source }: Props) => {
  const events = await prisma.events.findMany({
    where: {
      source,
    },
  });

  return EventSchema.array().parse(events);
};
