import { ListEventsSchema } from "@conquest/zod/types/livestorm";

type Props = {
  accessToken?: string;
  page: number;
  filter?: string;
};

export const listEvents = async ({ accessToken, page, filter }: Props) => {
  const params = new URLSearchParams();
  params.set("page[size]", "100");
  params.set("page[number]", page.toString());
  if (filter) params.set("filter[title]", filter);

  const response = await fetch(
    `https://api.livestorm.co/v1/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const { data } = ListEventsSchema.parse(await response.json());
  return data;
};
