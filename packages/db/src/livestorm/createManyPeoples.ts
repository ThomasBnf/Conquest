import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { createMember } from "@conquest/clickhouse/members/createMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import type { Event } from "@conquest/zod/schemas/event.schema";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Session } from "@conquest/zod/types/livestorm";
import { wait } from "@trigger.dev/sdk/v3";
import { getLocaleByAlpha2 } from "country-locale-map";
import ISO6391 from "iso-639-1";
import { decrypt } from "../utils/decrypt";
import { listPeopleFromSession } from "./listPeopleFromSession";

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
  const { access_token, access_token_iv } = details;
  const { title, ended_at } = event;

  const decryptedAccessToken = await decrypt({
    access_token: access_token,
    iv: access_token_iv,
  });

  const createdMembers: Member[] = [];

  await wait.for({ seconds: 0.5 });

  const peoples = await listPeopleFromSession({
    access_token: decryptedAccessToken,
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

    const locale = getLocaleByAlpha2(ip_country_code);
    const languageCode = locale?.split("_")[0] ?? "";
    const language = languageCode ? ISO6391.getName(languageCode) : "";

    let profile = await getProfile({ external_id: id });

    if (!profile) {
      const member = await createMember({
        first_name,
        last_name,
        primary_email: email,
        avatar_url: avatar_link ?? "",
        country: ip_country_code,
        language,
        source: "Livestorm",
        created_at: new Date(created_at * 1000),
        workspace_id,
      });

      createdMembers.push(member);

      profile = await createProfile({
        external_id: id,
        attributes: {
          source: "Livestorm",
        },
        member_id: member.id,
        created_at: new Date(created_at * 1000),
        workspace_id,
      });
    }

    if (is_guest_speaker && ended_at) {
      await createActivity({
        activity_type_key: "livestorm:co-host",
        member_id: profile.member_id,
        event_id: event.id,
        created_at: ended_at,
        source: "Livestorm",
        workspace_id,
      });
    }

    if (attended && ended_at) {
      await createActivity({
        activity_type_key: "livestorm:attend",
        member_id: profile.member_id,
        event_id: event.id,
        created_at: ended_at,
        source: "Livestorm",
        workspace_id,
      });
    }

    await createActivity({
      activity_type_key: "livestorm:register",
      member_id: profile.member_id,
      event_id: event.id,
      created_at: new Date(created_at * 1000),
      source: "Livestorm",
      workspace_id,
    });
  }

  return createdMembers;
};
