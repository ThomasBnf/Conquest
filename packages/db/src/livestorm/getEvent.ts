import { EventSchema } from "@conquest/zod/types/livestorm";

type Props = {
  accessToken: string;
  id: string;
};

export const getEvent = async ({ accessToken, id }: Props) => {
  const response = await fetch(`https://api.livestorm.co/v1/events/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.api+json",
    },
  });

  const { data } = await response.json();
  return EventSchema.parse(data);
};
