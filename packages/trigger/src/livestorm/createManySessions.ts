import { createEvent } from "@conquest/db/events/createEvent";
import { decrypt } from "@conquest/db/utils/decrypt";
import { EventSchema } from "@conquest/zod/schemas/event.schema";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Event, Session } from "@conquest/zod/types/livestorm";
import { logger } from "@trigger.dev/sdk/v3";
import { createManyPeoples } from "./createManyPeoples";
import { listEventSessions } from "./listEventSessions";

type Props = {
  livestorm: LivestormIntegration;
  event: Event;
};

export const createManySessions = async ({ livestorm, event }: Props) => {
  const { workspaceId, details } = livestorm;
  const { accessToken, accessTokenIv } = details;

  const decryptedAccessToken = await decrypt({
    accessToken,
    iv: accessTokenIv,
  });

  const { attributes } = event;
  const { title } = attributes;

  let sessionPage = 0;
  const allSessions: Session[] = [];

  while (true) {
    const listOfSessions = await listEventSessions({
      accessToken: decryptedAccessToken,
      eventId: event.id,
      page: sessionPage,
    });

    logger.info("listOfSessions", { listOfSessions });

    if (!listOfSessions?.length) break;

    allSessions.push(...listOfSessions);
    sessionPage++;

    if (listOfSessions.length < 100) break;
  }

  for (const session of allSessions) {
    const { attributes } = session;
    const { name, estimated_started_at, ended_at } = attributes;

    const createdEvent = await createEvent({
      externalId: session.id,
      title: name ? `${title} - ${name}` : title,
      startedAt: new Date(estimated_started_at * 1000),
      endedAt: ended_at ? new Date(ended_at * 1000) : null,
      source: "Livestorm",
      workspaceId,
    });

    const event = EventSchema.parse(createdEvent);

    await createManyPeoples({ livestorm, event, session });
  }
};
