import { decrypt } from "@conquest/db/utils/decrypt";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Event } from "@conquest/zod/types/livestorm";
import { logger } from "@trigger.dev/sdk/v3";
import { createManySessions } from "./createManySessions";
import { listEvents } from "./listEvents";

type Props = {
  livestorm: LivestormIntegration;
};

export const createManyEvents = async ({ livestorm }: Props) => {
  const { details } = livestorm;
  const { access_token, access_token_iv, filter } = details;

  const decryptedAccessToken = await decrypt({
    access_token: access_token,
    iv: access_token_iv,
  });

  const events: Event[] = [];

  let page = 0;

  while (true) {
    const listOfEvents = await listEvents({
      access_token: decryptedAccessToken,
      page,
      filter,
    });

    logger.info("listOfEvents", { listOfEvents });

    if (!listOfEvents?.length) break;

    events.push(...listOfEvents);
    page++;

    if (listOfEvents.length < 100) break;
  }

  for (const event of events) {
    await createManySessions({ livestorm, event });
  }
};
