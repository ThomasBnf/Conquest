import { EventSchema } from "@conquest/zod/schemas/event.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
};

export const getEvent = async ({ id }: Props) => {
  const event = await prisma.event.findUnique({
    where: {
      external_id: id,
    },
  });
  return EventSchema.parse(event);
};
