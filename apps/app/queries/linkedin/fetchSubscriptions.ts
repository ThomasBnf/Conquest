import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";

type Props = {
  linkedin: LinkedInIntegration;
};

export const fetchSubscriptions = async ({ linkedin }: Props) => {
  const { details } = linkedin;
  const { access_token } = details;

  const url =
    "https://api.linkedin.com/rest/eventSubscriptions?q=subscriberAndEventType&eventType=ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "LinkedIn-Version": "202411",
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.log("LinkedIn API Error:", data);
    return { success: false, data: null };
  }

  return { success: true, data };
};
