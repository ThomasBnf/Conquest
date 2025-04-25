import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { createMember } from "@conquest/clickhouse/members/createMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { createEvent } from "@conquest/db/events/createEvent";
import { getEvent } from "@conquest/db/events/getEvent";
import { getIntegration } from "@conquest/db/integrations/getIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { getEvent as getLivestormEvent } from "@conquest/trigger/livestorm/getEvent";
import { getRefreshToken } from "@conquest/trigger/livestorm/getRefreshToken";
import { listEventSessions } from "@conquest/trigger/livestorm/listEventSessions";
import { listPeopleFromSession } from "@conquest/trigger/livestorm/listPeopleFromSession";
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

  const integration = await getIntegration({ externalId: organization_id });
  if (!integration) return NextResponse.json(200);

  const livestorm = LivestormIntegrationSchema.parse(integration);
  const { workspaceId, details } = livestorm;
  const { filter, accessToken, accessTokenIv, expiresIn } = details;

  let currentAccessToken = await decrypt({
    accessToken,
    iv: accessTokenIv,
  });

  if (expiresIn < Date.now()) {
    currentAccessToken = await getRefreshToken({ livestorm });
  }

  if (event === "session.created") {
    const parsedAttributes = SessionWebhookSchema.parse(attributes);
    const { event_id } = parsedAttributes;

    const event = await getLivestormEvent({
      accessToken: currentAccessToken,
      id: event_id,
    });

    const { title } = event.attributes;

    if (filter && !title.includes(filter)) return NextResponse.json(200);
    let sessionPage = 0;

    const allSessions: Session[] = [];

    while (true) {
      const listOfSessions = await listEventSessions({
        accessToken: currentAccessToken,
        eventId: event_id,
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
        externalId: session.id,
        title: name ? `${title} - ${name}` : title,
        startedAt: new Date(estimated_started_at * 1000),
        endedAt: ended_at ? new Date(ended_at * 1000) : null,
        source: "Livestorm",
        workspaceId,
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

    const locale = ip_country_code ? getLocaleByAlpha2(ip_country_code) : "";
    const languageCode = locale?.split("_")[0] ?? "";
    const language = languageCode ? ISO6391.getName(languageCode) : "";

    let profile = await getProfile({ externalId: id, workspaceId });

    if (!profile) {
      const member = await createMember({
        firstName: first_name,
        lastName: last_name,
        primaryEmail: email,
        avatarUrl: avatar_link ?? "",
        country: ip_country_code ?? "",
        language,
        source: "Livestorm",
        createdAt: new Date(created_at * 1000),
        workspaceId,
      });

      profile = await createProfile({
        externalId: id,
        attributes: {
          source: "Livestorm",
        },
        memberId: member.id,
        workspaceId,
      });
    }

    await createActivity({
      activityTypeKey: "livestorm:register",
      memberId: profile.memberId,
      eventId: session.id,
      source: "Livestorm",
      workspaceId,
    });
  }

  if (event === "session.ended") {
    const session = await getEvent({ id });
    const peoples = await listPeopleFromSession({
      accessToken: currentAccessToken,
      id,
    });

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

      let profile = await getProfile({ externalId: id, workspaceId });

      if (!profile) {
        const member = await createMember({
          firstName: first_name,
          lastName: last_name,
          primaryEmail: email,
          avatarUrl: avatar_link ?? "",
          country: ip_country_code ?? "",
          language,
          source: "Livestorm",
          createdAt: new Date(created_at * 1000),
          workspaceId,
        });

        profile = await createProfile({
          externalId: id,
          attributes: {
            source: "Livestorm",
          },
          memberId: member.id,
          workspaceId,
        });
      }

      if (is_guest_speaker) {
        await createActivity({
          activityTypeKey: "livestorm:co-host",
          memberId: profile.memberId,
          eventId: session.id,
          source: "Livestorm",
          workspaceId,
        });
      } else {
        await createActivity({
          activityTypeKey: "livestorm:attend",
          memberId: profile.memberId,
          eventId: session.id,
          source: "Livestorm",
          workspaceId,
        });
      }
    }
  }

  return NextResponse.json(200);
}
