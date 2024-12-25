import { LIVESTORM_ACTIVITY_TYPES } from "@/constant";
import { sleep } from "@/helpers/sleep";
import { prisma } from "@/lib/prisma";
import { createActivity } from "@/queries/activities/createActivity";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { getActivityType } from "@/queries/activity-type/getActivityType";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createWebhook } from "@/queries/livestorm/createWebhook";
import { getRefreshToken } from "@/queries/livestorm/getRefreshToken";
import { listEventSessions } from "@/queries/livestorm/listEventSessions";
import { listEvents } from "@/queries/livestorm/listEvents";
import { listPeopleFromSession } from "@/queries/livestorm/listPeopleFromSession";
import { upsertMember } from "@/queries/members/upsertMember";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { Event, Session } from "@conquest/zod/schemas/types/livestorm";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installLivestorm = schemaTask({
  id: "install-livestorm",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    livestorm: LivestormIntegrationSchema,
    organization_id: z.string(),
  }),
  run: async ({ livestorm, organization_id }) => {
    const { id, details, workspace_id } = livestorm;
    const { access_token, expires_in } = details;

    const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();

    let accessToken = access_token;

    if (isExpired) {
      accessToken = await getRefreshToken(livestorm);
    }

    const webhookEvents = ["session.created", "session.ended"];

    for (const event of webhookEvents) {
      await createWebhook({
        accessToken,
        event,
      });
    }

    await updateIntegration({
      id,
      details: {
        ...details,
        access_token: accessToken,
        organization_id,
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
      const listOfEvents = await listEvents({ accessToken, page });
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

        await prisma.events.create({
          data: {
            external_id: session.id,
            source: "LIVESTORM",
            title: name ? `${title} - ${name}` : title,
            started_at: new Date(estimated_started_at * 1000),
            ended_at: new Date(ended_at * 1000),
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
          } = attributes;
          const { ip_country_code } = registrant_detail;

          if (role === "team_member") continue;

          const createdMember = await upsertMember({
            id,
            data: {
              first_name,
              last_name,
              primary_email: email,
              avatar_url: avatar_link,
              locale: ip_country_code,
              source: "LIVESTORM",
              workspace_id,
            },
          });

          const activityType = await getActivityType({
            key: "livestorm:attend",
            workspace_id,
          });

          await createActivity({
            external_id: null,
            activity_type_id: activityType.id,
            message: `Attended the Livestorm event: ${title}`,
            member_id: createdMember.id,
            workspace_id,
          });
        }
      }
    }
  },
  onSuccess: async ({ livestorm }) => {
    await updateIntegration({
      id: livestorm.id,
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
