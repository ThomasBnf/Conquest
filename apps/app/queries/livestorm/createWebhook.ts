import type { Webhook } from "@conquest/zod/types/livestorm";

type Props = {
  accessToken: string;
  event: string;
};

export const createWebhook = async ({ accessToken, event }: Props) => {
  const response = await fetch("https://api.livestorm.co/v1/webhooks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.api+json",
      "content-type": "application/vnd.api+json",
    },
    body: `{"data":{"type":"webhooks","attributes":{"url":"${process.env.NEXT_PUBLIC_URL}/api/webhook/livestorm","event":"${event}"}}}`,
  });

  const { data } = await response.json();
  return data as Webhook;
};
