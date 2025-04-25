import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { format } from "date-fns";
import { client } from "../client";

type Props = Partial<ActivityType>;

export const createActivityType = async (props: Props) => {
  const { updatedAt, createdAt, ...rest } = props;

  return await client.insert({
    table: "activityType",
    values: [
      {
        ...rest,
        updatedAt: format(updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
        createdAt: format(createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      },
    ],
    format: "JSON",
  });
};
