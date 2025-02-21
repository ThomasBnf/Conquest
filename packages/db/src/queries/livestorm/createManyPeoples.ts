import type { Event } from "@conquest/zod/schemas/event.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Session } from "@conquest/zod/types/livestorm";
import { wait } from "@trigger.dev/sdk/v3";
import { listPeopleFromSession } from "../../queries/livestorm/listPeopleFromSession";
import { createActivity } from "../activity/createActivity";
import { upsertMember } from "../member/upsertMember";
import { upsertProfile } from "../profile/upsertProfile";

type Props = {
  event: Event;
  session: Session;
  access_token: string;
  workspace_id: string;
};

export const createManyPeoples = async ({
  event,
  session,
  access_token,
  workspace_id,
}: Props) => {
  const { title, ended_at } = event;

  const createdMembers: Member[] = [];

  await wait.for({ seconds: 0.5 });

  const peoples = await listPeopleFromSession({
    access_token,
    id: session.id,
  });

  await wait.for({ seconds: 0.5 });

  for (const people of peoples) {
    console.log(people);
    const { id, attributes } = people;
    const {
      email,
      first_name,
      last_name,
      avatar_link,
      registrant_detail,
      role,
      created_at,
    } = attributes;
    const { ip_country_code, attended, is_guest_speaker } = registrant_detail;

    if (role === "team_member") continue;

    // const locale = getLocaleByAlpha2(ip_country_code) ?? null;

    const member = await upsertMember({
      id,
      data: {
        first_name,
        last_name,
        primary_email: email,
        avatar_url: avatar_link,
        // locale,
      },
      source: "LIVESTORM",
      workspace_id,
    });

    await upsertProfile({
      external_id: id,
      attributes: {
        source: "LIVESTORM",
      },
      member_id: member.id,
      workspace_id,
    });

    if (is_guest_speaker && ended_at) {
      await createActivity({
        external_id: null,
        activity_type_key: "livestorm:co-host",
        message: `Co-hosted to: ${title}`,
        member_id: member.id,
        event_id: event.id,
        created_at: ended_at,
        source: "LIVESTORM",
        workspace_id,
      });
    }

    if (attended && ended_at) {
      await createActivity({
        external_id: null,
        activity_type_key: "livestorm:attend",
        message: `Attended to: ${title}`,
        member_id: member.id,
        event_id: event.id,
        created_at: ended_at,
        source: "LIVESTORM",
        workspace_id,
      });
    }

    await createActivity({
      external_id: null,
      activity_type_key: "livestorm:register",
      message: `Registered to: ${title}`,
      member_id: member.id,
      event_id: event.id,
      created_at: new Date(created_at * 1000),
      source: "LIVESTORM",
      workspace_id,
    });

    createdMembers.push(member);
  }

  return createdMembers;
};
