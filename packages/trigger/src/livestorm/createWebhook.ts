import { env } from "@conquest/env";

type Props = {
  accessToken: string;
  event: string;
};

export const createWebhook = async ({ accessToken, event }: Props) => {
  return await fetch("https://api.livestorm.co/v1/webhooks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.api+json",
      "content-type": "application/vnd.api+json",
    },
    body: `{"data":{"type":"webhooks","attributes":{"url":"${env.NEXT_PUBLIC_URL}/webhook/livestorm","event":"${event}"}}}`,
  });
};
