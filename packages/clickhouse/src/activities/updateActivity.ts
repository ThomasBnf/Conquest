import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { client } from "../client";

type Props = Activity;

export const updateActivity = async ({
  id,
  externalId,
  workspaceId,
  updatedAt,
  createdAt,
  ...data
}: Props) => {
  const values = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE activity
      UPDATE ${values}, updatedAt = now()
      WHERE id = '${id}' 
    `,
  });
};
