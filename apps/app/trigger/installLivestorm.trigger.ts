import { sleep } from "@/helpers/sleep";
import { prisma } from "@/lib/prisma";
import { createActivity } from "@/queries/activities/createActivity";
import { getActivityType } from "@/queries/activity-type/getActivityType";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
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
    integration: LivestormIntegrationSchema,
    api_key: z.string(),
  }),
  run: async ({ integration, api_key }) => {
    const { workspace_id } = integration;

    await prisma.integrations.update({
      where: { id: integration.id },
      data: {
        details: {
          source: "LIVESTORM",
          api_key,
        },
        status: "SYNCING",
      },
    });

    const events: Event[] = [];
    let page = 0;

    while (true) {
      const listOfEvents = await listEvents({ api_key, page });
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
          api_key,
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
          api_key,
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
          } = attributes;
          const { ip_country_code } = registrant_detail;

          const formattedLocale = new Intl.DisplayNames(["en"], {
            type: "region",
          }).of(ip_country_code);

          const createdMember = await upsertMember({
            id,
            first_name,
            last_name,
            email,
            avatar_url: avatar_link,
            source: "LIVESTORM",
            locale: formattedLocale,
            phone: null,
            workspace_id,
          });

          const activityType = await getActivityType({
            key: "livestorm:attend",
            workspace_id,
          });

          await createActivity({
            external_id: null,
            activity_type_id: activityType.id,
            message: "Attend event",
            member_id: createdMember.id,
            workspace_id,
          });
        }
      }
    }
  },
  onSuccess: async ({ integration: { external_id } }) => {
    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "INSTALLED",
    });
  },
  onFailure: async ({ integration }) => {
    await deleteIntegration({
      source: "LIVESTORM",
      integration,
    });
  },
});
