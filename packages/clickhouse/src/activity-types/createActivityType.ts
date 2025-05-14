import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = Partial<ActivityType>;

export const createActivityType = async (props: Props) => {
  return await client.insert({
    table: "activityType",
    values: [props],
    format: "JSON",
  });
};
