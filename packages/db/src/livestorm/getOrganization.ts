import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { getRefreshToken } from "@conquest/db/livestorm/getRefreshToken";
import { decrypt } from "@conquest/db/utils/decrypt";
import type { LivestormIntegration } from "@conquest/zod/schemas/integration.schema";

type Props = {
  livestorm: LivestormIntegration;
};

export const getOrganization = async ({ livestorm }: Props) => {
  const { details, workspace_id } = livestorm;
  const { access_token, access_token_iv, expires_in } = details;
  const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();

  const decryptedAccessToken = await decrypt({
    access_token: access_token,
    iv: access_token_iv,
  });

  let accessToken = decryptedAccessToken;

  if (isExpired) {
    accessToken = await getRefreshToken({ livestorm });
  }

  const response = await fetch(
    "https://api.livestorm.co/v1/organization?include=organization",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: "application/vnd.api+json",
      },
    },
  );

  const organization = await response.json();
  const { included } = organization ?? {};

  const organization_id = included?.at(0)?.id ?? "";
  const organization_name = included?.at(0)?.attributes.name ?? "";

  return await updateIntegration({
    id: livestorm.id,
    external_id: organization_id,
    details: {
      ...livestorm.details,
      name: organization_name,
      filter: "",
    },
    workspace_id,
  });
};
