import { EventSchema } from "@conquest/zod/schemas/event.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Event, Session } from "@conquest/zod/types/livestorm";
import { listEventSessions } from "../../queries/livestorm/listEventSessions";
import { createEvent } from "../events/createEvent";
import { createManyPeoples } from "./createManyPeoples";

type Props = {
  event: Event;
  access_token: string;
  workspace_id: string;
};

export const createManySessions = async ({
  event,
  access_token,
  workspace_id,
}: Props) => {
  const members: Member[] = [];

  const { attributes } = event;
  const { title } = attributes;

  let sessionPage = 0;
  const allSessions: Session[] = [];

  while (true) {
    const listOfSessions = await listEventSessions({
      access_token,
      event_id: event.id,
      page: sessionPage,
    });

    if (!listOfSessions?.length) break;

    allSessions.push(...listOfSessions);
    sessionPage++;

    if (listOfSessions.length < 100) break;
  }

  for (const session of allSessions) {
    const { attributes } = session;
    const { name, estimated_started_at, ended_at } = attributes;

    const createdEvent = await createEvent({
      external_id: session.id,
      source: "LIVESTORM",
      title: name ? `${title} - ${name}` : title,
      started_at: new Date(estimated_started_at * 1000),
      ended_at: ended_at ? new Date(ended_at * 1000) : null,
      workspace_id,
    });

    const event = EventSchema.parse(createdEvent);

    const members = await createManyPeoples({
      event,
      session,
      access_token,
      workspace_id,
    });

    members.push(...members);
  }

  return members;
};
