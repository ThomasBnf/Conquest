import { prisma } from "@/lib/prisma";
import type { Source } from "@conquest/zod/enum/source.enum";
import { EventSchema } from "@conquest/zod/schemas/event.schema";

type Props = {
  source: Source;
  workspace_id: string;
};

export const listEvents = async ({ source, workspace_id }: Props) => {
  const events = await prisma.events.findMany({
    where: {
      source,
      workspace_id,
    },
    orderBy: {
      started_at: "desc",
    },
  });

  return EventSchema.array().parse(events);
};
