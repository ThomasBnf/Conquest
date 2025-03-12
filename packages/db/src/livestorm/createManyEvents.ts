import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Event } from "@conquest/zod/types/livestorm";
import { decrypt } from "../utils/decrypt";
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

  const members: Member[] = [];
  const events: Event[] = [];

  let page = 0;

  while (true) {
    const listOfEvents = await listEvents({
      access_token: decryptedAccessToken,
      page,
      filter,
    });
    if (!listOfEvents?.length) break;

    events.push(...listOfEvents);
    page++;

    if (listOfEvents.length < 100) break;
  }

  for (const event of events) {
    const members = await createManySessions({ livestorm, event });
    members.push(...members);
  }

  return members;
};
