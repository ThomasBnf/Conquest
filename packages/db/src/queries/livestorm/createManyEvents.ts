import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import type { Event } from "@conquest/zod/types/livestorm";
import { listEvents } from "../../queries/livestorm/listEvents";
import { createManySessions } from "./createManySessions";

type Props = {
  livestorm: LivestormIntegration;
};

export const createManyEvents = async ({ livestorm }: Props) => {
  const { details } = livestorm;
  const { access_token, filter } = details;

  const members: MemberWithCompany[] = [];

  const events: Event[] = [];
  let page = 0;

  while (true) {
    const listOfEvents = await listEvents({ access_token, page, filter });
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
