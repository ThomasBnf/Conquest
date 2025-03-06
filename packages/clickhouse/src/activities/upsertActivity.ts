import type { Source } from "@conquest/zod/enum/source.enum";
import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { getActivityTypeByKey } from "../activity-types/getActivityTypeByKey";
import { createActivity } from "./createActivity";
import { getActivity } from "./getActivity";
import { updateActivity } from "./updateActivity";

type Props = {
  external_id: string;
  activity_type_key: string;
  message: string;
  member_id: string;
  source: Source;
  workspace_id: string;
} & Partial<Activity>;

export const upsertActivity = async (props: Props) => {
  const {
    external_id,
    activity_type_key,
    message,
    member_id,
    source,
    workspace_id,
    ...data
  } = props;

  const activity = await getActivity({
    external_id,
    workspace_id,
  });

  if (activity) {
    const activityType = await getActivityTypeByKey({
      key: activity_type_key,
      workspace_id,
    });

    if (!activityType) {
      throw new Error(`Activity type ${activity_type_key} not found`);
    }

    await updateActivity({
      ...activity,
      activity_type_id: activityType.id,
    });
  } else {
    await createActivity({
      external_id,
      activity_type_key,
      message,
      member_id,
      source,
      workspace_id,
      ...data,
    });
  }
};
