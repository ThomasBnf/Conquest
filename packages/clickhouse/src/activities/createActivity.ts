import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { randomUUID } from "node:crypto";
import { getActivityTypeByKey } from "../activity-types/getActivityTypeByKey";
import { client } from "../client";
import { getActivity } from "./getActivity";

type Props = {
  activity_type_key: string;
  workspace_id: string;
} & Partial<Activity>;

export const createActivity = async (props: Props) => {
  const { activity_type_key, activity_type_id, workspace_id, ...rest } = props;

  const activityType = await getActivityTypeByKey({
    key: activity_type_key,
    workspace_id,
  });

  if (!activityType) throw new Error("Activity type not found");

  const id = randomUUID();

  await client.insert({
    table: "activity",
    values: [
      {
        ...rest,
        id,
        activity_type_id: activityType.id,
        workspace_id,
      },
    ],
    format: "JSON",
  });

  return await getActivity({ id, workspace_id });
};
