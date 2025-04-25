import type { Source } from "@conquest/zod/enum/source.enum";
import { EventSchema } from "@conquest/zod/schemas/event.schema";
import { prisma } from "../prisma";

type Props = {
  source: Source;
  workspaceId: string;
};

export const listEvents = async ({ source, workspaceId }: Props) => {
  const events = await prisma.event.findMany({
    where: {
      source,
      workspaceId,
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  return EventSchema.array().parse(events);
};
