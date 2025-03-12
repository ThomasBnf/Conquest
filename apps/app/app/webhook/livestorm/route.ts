import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { createMember } from "@conquest/clickhouse/members/createMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { createEvent } from "@conquest/db/events/createEvent";
import { getEvent } from "@conquest/db/events/getEvent";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { getEvent as getLivestormEvent } from "@conquest/db/livestorm/getEvent";
import { getRefreshToken } from "@conquest/db/livestorm/getRefreshToken";
import { listEventSessions } from "@conquest/db/livestorm/listEventSessions";
import { listPeopleFromSession } from "@conquest/db/livestorm/listPeopleFromSession";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  PeopleRegisteredSchema,
  type Session,
  SessionWebhookSchema,
} from "@conquest/zod/types/livestorm";
import { getLocaleByAlpha2 } from "country-locale-map";
import ISO6391 from "iso-639-1";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { data } = await request.json();
  const { id, attributes, meta } = data;
  const { event, organization_id } = meta.webhook;

  const integration = await getIntegration({ external_id: organization_id });

  if (!integration) return NextResponse.json(200);

  const livestorm = LivestormIntegrationSchema.parse(integration);
  const { workspace_id, details } = livestorm;
  const { filter } = details;

  const access_token = await getRefreshToken({ livestorm });

  if (event === "session.created") {
    const parsedAttributes = SessionWebhookSchema.parse(attributes);
    const { event_id } = parsedAttributes;

    const event = await getLivestormEvent({
      accessToken: access_token,
      id: event_id,
    });
    const { title } = event.attributes;

    if (filter && !title.includes(filter)) return NextResponse.json(200);
    let sessionPage = 0;

    const allSessions: Session[] = [];

    while (true) {
      const listOfSessions = await listEventSessions({
        access_token,
        event_id,
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

      await createEvent({
        external_id: session.id,
        title: name ? `${title} - ${name}` : title,
        started_at: new Date(estimated_started_at * 1000),
        ended_at: ended_at ? new Date(ended_at * 1000) : null,
        source: "Livestorm",
        workspace_id,
      });
    }

    return NextResponse.json(200);
  }

  if (event === "people.registered") {
    const parsedAttributes = PeopleRegisteredSchema.parse(attributes);

    const {
      first_name,
      last_name,
      email,
      avatar_link,
      registrant_detail,
      role,
      created_at,
    } = parsedAttributes;

    if (role === "team_member") return NextResponse.json(200);

    const { session_id, ip_country_code } = registrant_detail;
    const session = await getEvent({ id: session_id });

    const { title } = session;
    const locale = ip_country_code ? getLocaleByAlpha2(ip_country_code) : "";
    const languageCode = locale?.split("_")[0] ?? "";
    const language = languageCode ? ISO6391.getName(languageCode) : "";

    let profile = await getProfile({ external_id: id });

    if (!profile) {
      const member = await createMember({
        first_name,
        last_name,
        primary_email: email,
        avatar_url: avatar_link ?? "",
        country: ip_country_code ?? "",
        language,
        source: "Livestorm",
        created_at: new Date(created_at * 1000),
        workspace_id,
      });

      profile = await createProfile({
        external_id: id,
        attributes: {
          source: "Livestorm",
        },
        member_id: member.id,
        workspace_id,
      });
    }

    await createActivity({
      activity_type_key: "livestorm:register",
      message: `Registered to: ${title}`,
      member_id: profile.member_id,
      event_id: session.id,
      workspace_id,
    });
  }

  if (event === "session.ended") {
    const session = await getEvent({ id });
    const { title } = session;

    const peoples = await listPeopleFromSession({ access_token, id });

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

      if (role === "team_member") continue;
      const { ip_country_code, is_guest_speaker } = registrant_detail;

      const locale = ip_country_code ? getLocaleByAlpha2(ip_country_code) : "";
      const languageCode = locale?.split("_")[0] ?? "";
      const language = languageCode ? ISO6391.getName(languageCode) : "";

      let profile = await getProfile({ external_id: id });

      if (!profile) {
        const member = await createMember({
          first_name,
          last_name,
          primary_email: email,
          avatar_url: avatar_link ?? "",
          country: ip_country_code ?? "",
          language,
          source: "Livestorm",
          created_at: new Date(created_at * 1000),
          workspace_id,
        });

        profile = await createProfile({
          external_id: id,
          attributes: {
            source: "Livestorm",
          },
          member_id: member.id,
          workspace_id,
        });
      }

      if (is_guest_speaker) {
        await createActivity({
          activity_type_key: "livestorm:co-host",
          message: `Co-hosted to: ${title}`,
          member_id: profile.member_id,
          event_id: session.id,
          workspace_id,
        });
      } else {
        await createActivity({
          activity_type_key: "livestorm:attend",
          message: `Attended to: ${title}`,
          member_id: profile.member_id,
          event_id: session.id,
          workspace_id,
        });
      }
    }
  }

  return NextResponse.json(200);
}
