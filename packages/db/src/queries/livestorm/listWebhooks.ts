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

  const json = await response.json();

  console.log(json);

  if (!response.ok) throw new Error("Failed to list webhooks");

  const { data } = WebhookSchema.parse(json);
  return data;
};
