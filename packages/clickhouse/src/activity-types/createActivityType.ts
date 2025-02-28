import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { client } from "../client";

type Props = Partial<ActivityType>;

export const createActivityType = async (props: Props) => {
  return await client.insert({
    table: "activity_types",
    values: props,
    format: "JSON",
  });
};
