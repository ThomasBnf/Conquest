import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const getActivityType = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM activity_types
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return null;
  return ActivityTypeSchema.parse(data[0]);
};
