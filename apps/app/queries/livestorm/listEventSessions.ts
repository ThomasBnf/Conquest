import type { Session } from "@conquest/zod/schemas/types/livestorm";

type Props = {
  accessToken: string;
  event_id: string;
  page: number;
};

export const listEventSessions = async ({
  accessToken,
  event_id,
  page,
}: Props) => {
  const response = await fetch(
    `https://api.livestorm.co/v1/events/${event_id}/sessions?page[size]=100&page[number]=${page}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const { data } = await response.json();
  return data as Session[];
};
