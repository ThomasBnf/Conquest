import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { client } from "../client";

type Props = {
  external_id: string;
  activity_type_key: string;
  workspace_id: string;
} & Omit<Partial<Activity>, "updated_at">;

export const updateActivity = async ({ id, message }: Props) => {
  await client.query({
    query: `
      ALTER TABLE activities
      UPDATE 
        message = '${message}'
        updated_at = now()
      WHERE id = '${id}'
    `,
  });
};
