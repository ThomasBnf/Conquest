import type { Event } from "@conquest/zod/schemas/event.schema";
import { EventSchema } from "@conquest/zod/schemas/event.schema";
import { prisma } from "../prisma";

type Props = Pick<
  Event,
  | "external_id"
  | "title"
  | "started_at"
  | "ended_at"
  | "source"
  | "workspace_id"
>;

export const createEvent = async (data: Props) => {
  const event = await prisma.event.create({
    data,
  });

  return EventSchema.parse(event);
};
