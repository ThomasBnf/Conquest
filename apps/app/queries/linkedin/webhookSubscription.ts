import { env } from "@/env.mjs";
import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";

type WebhookSubscriptionParams = {
  linkedin: LinkedInIntegration;
};

export const webhookSubscription = async ({
  linkedin,
}: WebhookSubscriptionParams) => {
  const { external_id, details } = linkedin;
  const { user_id, access_token } = details;

  const urns = {
    developerApp: encodeURIComponent(
      `urn:li:developerApplication:${env.LINKEDIN_APP_ID}`,
    ),
    user: encodeURIComponent(`urn:li:person:${user_id}`),
    entity: encodeURIComponent(`urn:li:organization:${external_id}`),
    eventType: "ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS",
  };

  const params = Object.entries({
    developerApplication: urns.developerApp,
    user: urns.user,
    entity: urns.entity,
    eventType: urns.eventType,
  })
    .map(([key, value]) => `${key}:${value}`)
    .join(",");

  const response = await fetch(
    `https://api.linkedin.com/rest/eventSubscriptions/(${params})`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "LinkedIn-Version": "202411",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        webhook: `${env.NEXT_PUBLIC_BASE_URL}/api/linkedin`,
      }),
    },
  );

  const responseText = await response.text();

  if (!response.ok) throw new Error(`LinkedIn API Error: ${responseText}`);

  return responseText;
};
