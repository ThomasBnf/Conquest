import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = {
  id: string;
  data: Omit<Partial<ActivityType>, "updated_at">;
};

export const updateActivityType = async ({ id, data }: Props) => {
  const values = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  return await client.query({
    query: `
      ALTER TABLE activity_types 
      UPDATE 
        ${values},
        updated_at = now()
      WHERE id = '${id}'
    `,
  });
};
