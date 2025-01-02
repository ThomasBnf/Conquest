import type { Webhook } from "@conquest/zod/types/livestorm";

type Props = {
  accessToken: string;
};

export const listWebhooks = async ({ accessToken }: Props) => {
  const response = await fetch("https://api.livestorm.co/v1/webhooks", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.api+json",
    },
  });

  const { data } = await response.json();
  return data as Webhook[];
};
