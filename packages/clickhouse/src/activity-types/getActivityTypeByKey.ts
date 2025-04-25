import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = {
  key: string;
  workspaceId: string;
};

export const getActivityTypeByKey = async ({ key, workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM activityType
      WHERE key = '${key}'
      AND workspaceId = '${workspaceId}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return null;
  return ActivityTypeSchema.parse(data[0]);
};
