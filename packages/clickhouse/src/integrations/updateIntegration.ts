import type { Status } from "@conquest/zod/enum/status.enum";
import type { IntegrationDetails } from "@conquest/zod/schemas/integration.schema";
import { format } from "date-fns";
import { client } from "../client";
type Props = {
  id: string;
  external_id?: string;
  connected_at?: Date;
  details?: IntegrationDetails;
  status?: Status;
  trigger_token?: string;
  expires_at?: Date;
  created_by?: string;
};

export const updateIntegration = async ({
  id,
  external_id,
  connected_at,
  details,
  status,
  trigger_token,
  expires_at,
  created_by,
}: Props) => {
  const updateFields = [
    external_id ? `external_id = '${external_id}'` : null,
    connected_at
      ? `connected_at = '${format(connected_at, "yyyy-MM-dd HH:mm:ss")}'`
      : null,
    details ? `details = '${JSON.stringify(details)}'` : null,
    status ? `status = '${status}'` : null,
    trigger_token ? `trigger_token = '${trigger_token}'` : null,
    expires_at
      ? `expires_at = '${format(expires_at, "yyyy-MM-dd HH:mm:ss")}'`
      : null,
    created_by ? `created_by = '${created_by}'` : null,
    "updated_at = now()",
  ]
    .filter(Boolean)
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE integrations
      UPDATE ${updateFields}
      WHERE id = '${id}'
    `,
  });
};
