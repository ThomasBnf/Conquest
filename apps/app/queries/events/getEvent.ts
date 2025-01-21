import { prisma } from "@/lib/prisma";
import { EventSchema } from "@conquest/zod/schemas/event.schema";

type Props = {
  id: string;
};

export const getEvent = async ({ id }: Props) => {
  const event = await prisma.events.findUnique({
    where: {
      external_id: id,
    },
  });
  return EventSchema.parse(event);
};
