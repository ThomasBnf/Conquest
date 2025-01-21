import { env } from "@/env.mjs";
import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import { fetchSubscriptions } from "./fetchSubscriptions";

type WebhookSubscriptionParams = {
  linkedin: LinkedInIntegration;
};

export const unsubscribeWebhook = async ({
  linkedin,
}: WebhookSubscriptionParams) => {
  const { external_id, details } = linkedin;
  const { user_id, access_token } = details;

  const { data } = await fetchSubscriptions({ linkedin });

  console.log("initial subscriptions", data);

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
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "LinkedIn-Version": "202411",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    },
  );

  const responseText = await response.text();
  console.log("Unsubscribe response", responseText);

  if (!response.ok) {
    console.log(`LinkedIn API Error : ${responseText}`);
    return { success: false };
  }

  const { data: subscriptions } = await fetchSubscriptions({ linkedin });

  console.log("Check subscriptions", subscriptions);

  return { success: true };
};
