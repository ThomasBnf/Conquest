import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { client } from "../client";

type Props = Activity;

export const updateActivity = async ({
  id,
  external_id,
  workspace_id,
  updated_at,
  created_at,
  ...data
}: Props) => {
  const values = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE activity
      UPDATE ${values}, updated_at = now()
      WHERE id = '${id}' 
    `,
  });
};
