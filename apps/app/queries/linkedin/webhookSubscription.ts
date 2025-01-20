import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";

type WebhookSubscriptionParams = {
  linkedin: LinkedInIntegration;
};

export const webhookSubscription = async ({
  linkedin,
}: WebhookSubscriptionParams) => {
  const { external_id, details } = linkedin;
  const { user_id, access_token } = details;

  const developerApp = encodeURIComponent(
    "urn:li:developerApplication:221195903",
  );
  const userUrn = encodeURIComponent(`urn:${user_id}`);
  const orgUrn = encodeURIComponent(`urn:li:organization:${external_id}`);
  const eventType = "ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS";

  const params = `developerApplication:${developerApp},user:${userUrn},entity:${orgUrn},eventType:${eventType}`;
  console.log(params);

  const response = await fetch(
    `https://api.linkedin.com/rest/eventSubscriptions/${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "LinkedIn-Version": "202411",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LinkedIn API error:", errorText);
    throw new Error(`Failed to subscribe to webhook: ${response.statusText}`);
  }

  return { success: true, status: response.status };
};
