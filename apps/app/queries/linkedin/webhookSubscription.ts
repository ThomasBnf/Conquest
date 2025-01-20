import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";

type WebhookSubscriptionParams = {
  linkedin: LinkedInIntegration;
};

export const webhookSubscription = async ({
  linkedin,
}: WebhookSubscriptionParams) => {
  const { external_id, details } = linkedin;
  const { user_id, access_token } = details;

  const response = await fetch(
    `https://api.linkedin.com/rest/eventSubscriptions/(developerApplication:${encodeURIComponent(
      "urn:li:developerApplication:221195903",
    )},user:${encodeURIComponent(
      "urn:li:person:iuHQSczloT",
    )},entity:${encodeURIComponent(
      `urn:li:organization:${external_id}`,
    )},eventType:ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS)`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "LinkedIn-Version": "202411",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        webhook: "https://conquest.ngrok.app/api/linkedin",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to subscribe to webhook: ${response.statusText}`);
  }

  return response.json();
};
