import { ListEventSessionsSchema } from "@conquest/zod/types/livestorm";
import { startOfDay, subDays } from "date-fns";

type Props = {
  access_token: string;
  event_id: string;
  page: number;
};

export const listEventSessions = async ({
  access_token,
  event_id,
  page,
}: Props) => {
  const today = startOfDay(new Date());
  const last365Days = startOfDay(subDays(today, 365));

  const params = new URLSearchParams({
    "page[size]": "100",
    "page[number]": `${page}`,
    "filter[created_since]": last365Days.toISOString(),
  });

  const response = await fetch(
    `https://api.livestorm.co/v1/events/${event_id}/sessions?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );

  const json = await response.json();
  console.log("listEventSessions", json);
  const result = ListEventSessionsSchema.parse(json);
  return result.data;
};
