import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = {
  key: string;
  workspace_id: string;
};

export const getActivityTypeByKey = async ({ key, workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM activity_type
      WHERE key = '${key}'
      AND workspace_id = '${workspace_id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return null;
  return ActivityTypeSchema.parse(data[0]);
};
