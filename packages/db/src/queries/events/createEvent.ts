import type { Source } from "@conquest/zod/enum/source.enum";
import { EventSchema } from "@conquest/zod/schemas/event.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  title: string;
  started_at: string | Date;
  ended_at: string | Date | null;
  source: Source;
  workspace_id: string;
};
export const createEvent = async ({
  external_id,
  title,
  started_at,
  ended_at,
  source,
  workspace_id,
}: Props) => {
  const event = await prisma.event.create({
    data: {
      external_id,
      title,
      started_at,
      ended_at,
      source,
      workspace_id,
    },
  });

  return EventSchema.parse(event);
};
