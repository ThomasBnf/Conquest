import { env } from "@/env.mjs";
import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import { listSubscriptions } from "./listSubscriptions";

type WebhookSubscriptionParams = {
  linkedin: LinkedInIntegration;
};

export const webhookSubscription = async ({
  linkedin,
}: WebhookSubscriptionParams) => {
  const { external_id, details } = linkedin;
  const { user_id, access_token } = details;

  console.log(linkedin);
  console.log(linkedin.details);

  const urns = {
    developerApp: encodeURIComponent(
      `urn:li:developerApplication:${env.LINKEDIN_APP_ID}`,
    ),
    user: encodeURIComponent(`urn:li:person:${user_id}`),
    entity: encodeURIComponent(`urn:li:organization:${external_id}`),
    eventType: "ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS",
  };

  const subscriptions = await listSubscriptions({ linkedin });
  console.log(subscriptions);

  const params = Object.entries({
    developerApplication: urns.developerApp,
    user: urns.user,
    entity: urns.entity,
    eventType: urns.eventType,
  })
    .map(([key, value]) => `${key}:${value}`)
    .join(",");

  console.log(params);

  const response = await fetch(
    "https://api.linkedin.com/rest/eventSubscriptions/(developerApplication:urn%3Ali%3AdeveloperApplication%3A221195903,user:urn%3Ali%3Aperson%3AiuHQSczloT,entity:urn%3Ali%3Aorganization%3A105844665,eventType:ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS)",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "LinkedIn-Version": "202411",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        webhook: `${env.NEXT_PUBLIC_BASE_URL}/api/linkedin`,
      }),
    },
  );

  const responseText = await response.text();

  if (!response.ok) throw new Error(responseText);

  return responseText;
};
