import { ListEventsSchema } from "@conquest/zod/types/livestorm";

type Props = {
  filter?: string;
  page: number;
  access_token?: string;
};

export const listEvents = async ({ access_token, page, filter }: Props) => {
  const params = new URLSearchParams({
    "page[size]": "100",
    "page[number]": page.toString(),
    "filter[created_since]": new Date(
      Date.now() - 365 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  });

  if (filter) params.set("filter[title]", filter);

  const response = await fetch(
    `https://api.livestorm.co/v1/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );

  const json = await response.json();
  console.log("listEvents", json);
  const { data } = ListEventsSchema.parse(json);
  return data;
};
