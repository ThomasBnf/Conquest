import type { Event } from "@conquest/zod/schemas/event.schema";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import type { Session } from "@conquest/zod/types/livestorm";
import { wait } from "@trigger.dev/sdk/v3";
import { getLocaleByAlpha2 } from "country-locale-map";
import { createActivity } from "../../queries/activities/createActivity";
import { listPeopleFromSession } from "../../queries/livestorm/listPeopleFromSession";
import { upsertMember } from "../members/upsertMember";

type Props = {
  livestorm: LivestormIntegration;
  event: Event;
  session: Session;
};

export const createManyPeoples = async ({
  livestorm,
  event,
  session,
}: Props) => {
  const { workspace_id, details } = livestorm;
  const { access_token } = details;
  const { title, ended_at } = event;

  const createdMembers: MemberWithCompany[] = [];

  await wait.for({ seconds: 0.5 });

  const peoples = await listPeopleFromSession({
    access_token,
    id: session.id,
  });

  await wait.for({ seconds: 0.5 });

  for (const people of peoples) {
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

    const locale = getLocaleByAlpha2(ip_country_code) ?? null;

    const member = await upsertMember({
      id,
      data: {
        first_name,
        last_name,
        primary_email: email,
        avatar_url: avatar_link,
        locale,
      },
      source: "LIVESTORM",
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
      workspace_id,
    });

    createdMembers.push(member);
  }

  return createdMembers;
};
