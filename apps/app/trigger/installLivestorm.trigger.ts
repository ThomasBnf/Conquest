import { calculateMemberMetrics } from "@/client/dashboard/calculateMemberMetrics";
import { LIVESTORM_ACTIVITY_TYPES } from "@/constant";
import { sleep } from "@/helpers/sleep";
import { prisma } from "@/lib/prisma";
import { createActivity } from "@/queries/activities/createActivity";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createWebhook } from "@/queries/livestorm/createWebhook";
import { getRefreshToken } from "@/queries/livestorm/getRefreshToken";
import { listEventSessions } from "@/queries/livestorm/listEventSessions";
import { listEvents } from "@/queries/livestorm/listEvents";
import { listPeopleFromSession } from "@/queries/livestorm/listPeopleFromSession";
import { upsertMember } from "@/queries/members/upsertMember";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { Event, Session } from "@conquest/zod/types/livestorm";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { getLocaleByAlpha2 } from "country-locale-map";
import { z } from "zod";

export const installLivestorm = schemaTask({
  id: "install-livestorm",
  schema: z.object({
    livestorm: LivestormIntegrationSchema,
    organization_id: z.string(),
    organization_name: z.string(),
    filter: z.string().optional(),
  }),
  run: async ({ livestorm, organization_id, organization_name, filter }) => {
    const { id, details, workspace_id } = livestorm;
    const { access_token, expires_in } = details;

    const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();

    let accessToken = access_token;

    if (isExpired) {
      accessToken = await getRefreshToken(livestorm);
    }

    const webhookEvents = [
      "session.created",
      "session.ended",
      "people.registered",
    ];

    for (const event of webhookEvents) {
      await createWebhook({
        accessToken,
        event,
      });
    }

    await updateIntegration({
      id,
      external_id: organization_id,
      details: {
        ...details,
        name: organization_name,
        access_token: accessToken,
        filter,
      },
      status: "SYNCING",
    });

    await createManyActivityTypes({
      activity_types: LIVESTORM_ACTIVITY_TYPES,
      workspace_id,
    });

    const events: Event[] = [];
    let page = 0;

    while (true) {
      const listOfEvents = await listEvents({ accessToken, page, filter });
      if (!listOfEvents?.length) break;

      events.push(...listOfEvents);
      page++;

      if (listOfEvents.length < 100) break;
    }

    for (const event of events) {
      const { attributes } = event;
      const { title } = attributes;

      let sessionPage = 0;
      const allSessions: Session[] = [];

      while (true) {
        const listOfSessions = await listEventSessions({
          accessToken,
          event_id: event.id,
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

        const createdEvent = await prisma.events.create({
          data: {
            external_id: session.id,
            source: "LIVESTORM",
            title: name ? `${title} - ${name}` : title,
            started_at: new Date(estimated_started_at * 1000),
            ended_at: ended_at ? new Date(ended_at * 1000) : null,
            workspace_id,
          },
        });

        const peoples = await listPeopleFromSession({
          accessToken,
          id: session.id,
        });

        await sleep(500);

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
          const { ip_country_code, attended, is_guest_speaker } =
            registrant_detail;

          if (role === "team_member") continue;

          const locale = getLocaleByAlpha2(ip_country_code) ?? null;

          const createdMember = await upsertMember({
            id,
            data: {
              first_name,
              last_name,
              primary_email: email,
              avatar_url: avatar_link,
              locale,
              source: "LIVESTORM",
              workspace_id,
            },
          });

          if (is_guest_speaker) {
            await createActivity({
              external_id: null,
              activity_type_key: "livestorm:co-host",
              message: `Co-hosted the Livestorm event: ${title}`,
              member_id: createdMember.id,
              event_id: createdEvent.id,
              created_at: new Date(created_at * 1000),
              workspace_id,
            });
          } else {
            await createActivity({
              external_id: null,
              activity_type_key: "livestorm:register",
              message: `Registered for the Livestorm event: ${title}`,
              member_id: createdMember.id,
              event_id: createdEvent.id,
              created_at: new Date(ended_at * 1000),
              workspace_id,
            });

            if (attended) {
              await createActivity({
                external_id: null,
                activity_type_key: "livestorm:attend",
                message: `Attended the Livestorm event: ${title}`,
                member_id: createdMember.id,
                event_id: createdEvent.id,
                created_at: new Date(ended_at * 1000),
                workspace_id,
              });
            }
          }

          await calculateMemberMetrics({ member: createdMember });
        }
      }
    }
  },
  onSuccess: async ({ livestorm }) => {
    await updateIntegration({
      id: livestorm.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ livestorm }) => {
    await deleteIntegration({
      source: "LIVESTORM",
      integration: livestorm,
    });
  },
});
