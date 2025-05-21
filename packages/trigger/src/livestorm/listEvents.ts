import { ListEventsSchema } from "@conquest/zod/types/livestorm";
import { logger } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";

type Props = {
  accessToken: string;
  page: number;
  filter?: string;
};

export const listEvents = async ({ accessToken, page, filter }: Props) => {
  const last90Days = subDays(new Date(), 90);

  const params = new URLSearchParams({
    "page[size]": "100",
    "page[number]": page.toString(),
    "filter[created_since]": last90Days.toISOString(),
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
