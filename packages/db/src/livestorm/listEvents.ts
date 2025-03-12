import { ListEventsSchema } from "@conquest/zod/types/livestorm";

type Props = {
  access_token?: string;
  page: number;
  filter?: string;
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

  const result = await response.json();
  console.log("listEvents", result);
  const { data } = ListEventsSchema.parse(result);
  return data;
};
