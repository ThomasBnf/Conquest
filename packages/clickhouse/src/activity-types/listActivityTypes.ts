import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const listActivityTypes = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM activity_type
      WHERE workspace_id = '${workspace_id}'
      ORDER BY points DESC
    `,
  });

  const { data } = await result.json();
  return ActivityTypeSchema.array().parse(data);
};
