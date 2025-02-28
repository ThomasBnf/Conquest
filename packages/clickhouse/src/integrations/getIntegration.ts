import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { client } from "../client";

type Props = {
  external_id: string | null | undefined;
  workspace_id?: string;
};

export const getIntegration = async ({ external_id, workspace_id }: Props) => {
  if (!external_id) return undefined;

  const result = await client.query({
    query: `
      SELECT * 
      FROM integrations
      WHERE external_id = '${external_id}'
      ${workspace_id ? `AND workspace_id = '${workspace_id}'` : ""}
    `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return IntegrationSchema.parse(data[0]);
};
