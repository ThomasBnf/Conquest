import { prisma } from "../prisma";
import { EventSchema } from "@conquest/zod/schemas/event.schema";

type Props = {
  workspace_id: string;
};

export const listEvents = async ({ workspace_id }: Props) => {
  const events = await prisma.event.findMany({
    where: { workspace_id },
  });

  return EventSchema.array().parse(events);
};
