import { ListEventSessionsSchema } from "@conquest/zod/types/livestorm";
import { startOfDay, subDays } from "date-fns";

type Props = {
  accessToken: string;
  eventId: string;
  page: number;
};

export const listEventSessions = async ({
  accessToken,
  eventId,
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
    `https://api.livestorm.co/v1/events/${eventId}/sessions?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const { data } = ListEventSessionsSchema.parse(await response.json());
  return data;
};
