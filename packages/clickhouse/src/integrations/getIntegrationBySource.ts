import type { Source } from "@conquest/zod/enum/source.enum";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { client } from "../client";

type Props = {
  source: Source;
  workspace_id: string;
};

export const getIntegrationBySource = async ({
  source,
  workspace_id,
}: Props) => {
  if (!source || !workspace_id) return undefined;

  const result = await client.query({
    query: `
      SELECT * 
      FROM integrations
      WHERE 
        JSONExtractString(CAST(details AS String), 'source') = '${source}'
        AND workspace_id = '${workspace_id}'
      `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return IntegrationSchema.parse(data[0]);
};
