import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = { id: string } & Partial<ActivityType>;

export const updateActivityType = async (props: Props) => {
  await client.insert({
    table: "activity_type",
    values: [
      {
        ...props,
        updated_at: new Date(),
      },
    ],
    format: "JSON",
  });

  await client.query({
    query: "OPTIMIZE TABLE activity_type FINAL;",
  });
};
