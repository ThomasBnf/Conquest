import type { Event } from "@conquest/zod/schemas/types/livestorm";

type Props = {
  accessToken: string;
  page: number;
};

export const listEvents = async ({ accessToken, page }: Props) => {
  const response = await fetch(
    `https://api.livestorm.co/v1/events?page[size]=100&page[number]=${page}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const { data } = await response.json();
  return data as Event[];
};
