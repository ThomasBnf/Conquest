import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Event } from "@conquest/zod/types/livestorm";
import { listEvents } from "../../queries/livestorm/listEvents";
import { createManySessions } from "./createManySessions";

type Props = {
  filter?: string;
  access_token: string;
  workspace_id: string;
};

export const createManyEvents = async ({
  filter,
  access_token,
  workspace_id,
}: Props) => {
  const members: Member[] = [];
  const events: Event[] = [];

  let page = 0;

  while (true) {
    const listOfEvents = await listEvents({
      filter,
      page,
      access_token,
    });

    if (!listOfEvents?.length) break;

    events.push(...listOfEvents);
    page++;

    if (listOfEvents.length < 100) break;
  }

  for (const event of events) {
    const members = await createManySessions({
      event,
      access_token,
      workspace_id,
    });

    members.push(...members);
  }

  return members;
};
