import type { Webhook } from "@conquest/zod/schemas/types/livestorm";

type Props = {
  accessToken: string;
  event: string;
};

export const createWebhook = async ({ accessToken, event }: Props) => {
  const response = await fetch("https://api.livestorm.co/v1/webhooks", {
    method: "POST",
    headers: {
      accept: "application/vnd.api+json",
      "content-type": "application/vnd.api+json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: `{"data":{"type":"webhooks","attributes":{"url":"https://2e17b8a57252.ngrok.app/api/webhook/livestorm","event":"${event}"}}}`,
  });

  const { data } = await response.json();
  return data as Webhook;
};
