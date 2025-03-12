import { EventSchema } from "@conquest/zod/schemas/event.schema";
import { prisma } from "../prisma";

type Props = {
  workspace_id: string;
};

export const listEvents = async ({ workspace_id }: Props) => {
  const events = await prisma.event.findMany({
    where: { workspace_id },
    orderBy: { started_at: "desc" },
  });

  return EventSchema.array().parse(events);
};
