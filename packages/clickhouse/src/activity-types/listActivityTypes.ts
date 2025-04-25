import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = {
  workspaceId: string;
};

export const listActivityTypes = async ({ workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM activityType
      WHERE workspaceId = '${workspaceId}'
      ORDER BY points DESC
    `,
  });

  const { data } = await result.json();
  return ActivityTypeSchema.array().parse(data);
};
