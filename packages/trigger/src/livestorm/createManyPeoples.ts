import { createActivity } from "@conquest/clickhouse/activity/createActivity";
import { createMember } from "@conquest/clickhouse/member/createMember";
import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { decrypt } from "@conquest/db/utils/decrypt";
import type { Event } from "@conquest/zod/schemas/event.schema";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Session } from "@conquest/zod/types/livestorm";
import { logger, wait } from "@trigger.dev/sdk/v3";
import { getLocaleByAlpha2 } from "country-locale-map";
import ISO6391 from "iso-639-1";
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
  const { workspaceId, details } = livestorm;
  const { accessToken, accessTokenIv } = details;
  const { endedAt } = event;

  const decryptedAccessToken = await decrypt({
    accessToken,
    iv: accessTokenIv,
  });

  await wait.for({ seconds: 0.5 });

  const peoples = await listPeopleFromSession({
    accessToken: decryptedAccessToken,
    id: session.id,
  });

  logger.info("peoples", { peoples });

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

    const locale = getLocaleByAlpha2(ip_country_code ?? "");
    const languageCode = locale?.split("_")[0] ?? "";
    const language = languageCode ? ISO6391.getName(languageCode) : "";

    let profile = await getProfile({ externalId: id, workspaceId });

    if (!profile) {
      const member = await createMember({
        firstName: first_name,
        lastName: last_name,
        primaryEmail: email,
        emails: [email],
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
        createdAt: new Date(created_at * 1000),
        workspaceId,
      });
    }

    if (is_guest_speaker && endedAt) {
      await createActivity({
        activityTypeKey: "livestorm:co-host",
        memberId: profile.memberId,
        eventId: event.id,
        createdAt: endedAt,
        source: "Livestorm",
        workspaceId,
      });
    }

    if (attended && endedAt) {
      await createActivity({
        activityTypeKey: "livestorm:attend",
        memberId: profile.memberId,
        eventId: event.id,
        createdAt: endedAt,
        source: "Livestorm",
        workspaceId,
      });
    }

    await createActivity({
      activityTypeKey: "livestorm:register",
      memberId: profile.memberId,
      eventId: event.id,
      createdAt: new Date(created_at * 1000),
      source: "Livestorm",
      workspaceId,
    });
  }
};
