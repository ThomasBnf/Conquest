import { createEvent } from "@conquest/db/events/createEvent";
import { EventSchema } from "@conquest/zod/schemas/event.schema";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Event, Session } from "@conquest/zod/types/livestorm";
import { decrypt } from "../utils/decrypt";
import { createManyPeoples } from "./createManyPeoples";
import { listEventSessions } from "./listEventSessions";

type Props = {
  livestorm: LivestormIntegration;
  event: Event;
};

export const createManySessions = async ({ livestorm, event }: Props) => {
  const { workspace_id, details } = livestorm;
  const { access_token, access_token_iv } = details;

  const decryptedAccessToken = await decrypt({
    access_token: access_token,
    iv: access_token_iv,
  });

  const createdMembers: Member[] = [];

  const { attributes } = event;
  const { title } = attributes;

  let sessionPage = 0;
  const allSessions: Session[] = [];

  while (true) {
    const listOfSessions = await listEventSessions({
      access_token: decryptedAccessToken,
      event_id: event.id,
      page: sessionPage,
    });

    console.log("listOfSessions", listOfSessions);

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
      title: name ? `${title} - ${name}` : title,
      started_at: new Date(estimated_started_at * 1000),
      ended_at: ended_at ? new Date(ended_at * 1000) : null,
      source: "Livestorm",
      workspace_id,
    });

    const event = EventSchema.parse(createdEvent);

    const members = await createManyPeoples({ livestorm, event, session });
    createdMembers.push(...members);
  }

  return createdMembers;
};
