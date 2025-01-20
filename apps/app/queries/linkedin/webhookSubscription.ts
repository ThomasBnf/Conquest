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

  const developerApp = "urn:li:developerApplication:221195903";
  const userUrn = `urn:${user_id}`;
  const orgUrn = `urn:li:organization:${external_id}`;
  const eventType = "ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS";

  const params = `(developerApplication:${developerApp},user:${userUrn},entity:${orgUrn},eventType:${eventType})`;

  const response = await fetch(
    `https://api.linkedin.com/rest/eventSubscriptions/${params}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "LinkedIn-Version": "202411",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook: `${env.NEXT_PUBLIC_BASE_URL}/api/linkedin`,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LinkedIn API error:", errorText);
    throw new Error(`Failed to subscribe to webhook: ${response.statusText}`);
  }

  return { success: true, status: response.status };
};
