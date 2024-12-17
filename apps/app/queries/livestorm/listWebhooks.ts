import type { Webhook } from "@conquest/zod/schemas/types/livestorm";

type Props = {
  accessToken: string;
};

export const listWebhooks = async ({ accessToken }: Props) => {
  const response = await fetch("https://api.livestorm.co/v1/webhooks", {
    method: "GET",
    headers: {
      accept: "application/vnd.api+json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { data } = await response.json();
  return data as Webhook[];
};
