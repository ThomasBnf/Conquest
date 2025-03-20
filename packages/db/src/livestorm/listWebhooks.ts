import { WebhookSchema } from "@conquest/zod/types/livestorm";

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

  if (!response.ok) {
    const data = await response.json();
    return [];
  }

  const { data } = WebhookSchema.parse(await response.json());
  return data;
};
