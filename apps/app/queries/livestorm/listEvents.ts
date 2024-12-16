import type { Event } from "@conquest/zod/schemas/types/livestorm";

type Props = {
  api_key: string;
  page: number;
};

export const listEvents = async ({ api_key, page }: Props) => {
  const response = await fetch(
    `https://api.livestorm.co/v1/events?page[size]=100&page[number]=${page}`,
    {
      headers: {
        Authorization: api_key,
      },
    },
  );

  const { data } = await response.json();
  return data as Event[];
};
