import { sleep } from "@/helpers/sleep";
import type { Session } from "@conquest/zod/schemas/types/livestorm";
import { endOfDay, startOfDay } from "date-fns";
import { createActivity } from "../activities/createActivity";
import { getActivityType } from "../activity-type/getActivityType";
import { upsertMember } from "../members/upsertMember";
import { listPeopleFromSession } from "./listPeopleFromSession";

type Props = {
  api_key: string;
  workspace_id: string;
};

export const listPasEvents = async ({ api_key, workspace_id }: Props) => {
  const today = new Date();
  const dateFrom = startOfDay(today);
  const dateTo = endOfDay(today);

  let page = 0;

  while (true) {
    const response = await fetch(
      `https://api.livestorm.co/v1/events?page[number]=${page}&page[size]=100&filter[status]=past&filter[date_from]=${dateFrom}&filter[date_to]=${dateTo}`,
      {
        headers: {
          Authorization: api_key,
        },
      },
    );

    const { data } = await response.json();
    const sessionsData = data as Session[];
    const sessions = sessionsData.filter(
      (session) => session.attributes.ended_at > today.getTime(),
    );

    if (!sessions?.length) break;

    for (const session of sessions) {
      const peoples = await listPeopleFromSession({
        api_key,
        id: session.id,
      });

      await sleep(500);

      for (const people of peoples) {
        const { id, attributes } = people;
        const { email, first_name, last_name, avatar_link, registrant_detail } =
          attributes;
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

    page++;
  }
};
