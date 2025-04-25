import { ListEventsSchema } from "@conquest/zod/types/livestorm";
import { logger } from "@trigger.dev/sdk/v3";

type Props = {
  accessToken: string;
  page: number;
  filter?: string;
};

export const listEvents = async ({ accessToken, page, filter }: Props) => {
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
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    logger.error("listEvents", { response: await response.json() });
  }

  const { data } = ListEventsSchema.parse(await response.json());
  return data;
};
