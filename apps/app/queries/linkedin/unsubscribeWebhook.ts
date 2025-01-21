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

  console.log("subscriptions", data);

  const urns = {
    developerApp: encodeURIComponent(
      `urn:li:developerApplication:${env.LINKEDIN_APP_ID}`,
    ),
    user: encodeURIComponent(`urn:li:person:${user_id}`),
    entity: encodeURIComponent(`urn:li:organization:${external_id}`),
    eventType: "ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS",
  };

  const params = `developerApplication:${urns.developerApp},user:${urns.user},entity:${urns.entity},eventType:${urns.eventType}`;

  const url = `https://api.linkedin.com/rest/eventSubscriptions/(${params})`;
  console.log("LinkedIn API URL:", url);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "LinkedIn-Version": "202411",
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  const responseText = await response.text();
  const headers = response.headers;

  if (!response.ok) {
    console.log(`LinkedIn API Error : ${responseText}`);
    return { success: false };
  }

  return { success: true };
};
