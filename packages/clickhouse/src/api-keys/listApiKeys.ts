import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const listApiKeys = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM api_keys
      WHERE workspace_id = '${workspace_id}'
      ORDER BY created_at DESC
    `,
  });

  const { data } = await result.json();
  return APIKeySchema.array().parse(data);
};
