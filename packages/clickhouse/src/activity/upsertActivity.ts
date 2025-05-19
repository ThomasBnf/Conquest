import type { Source } from "@conquest/zod/enum/source.enum";
import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { getActivityTypeByKey } from "../activity-type/getActivityTypeByKey";
import { createActivity } from "./createActivity";
import { getActivity } from "./getActivity";
import { updateActivity } from "./updateActivity";

type Props = {
  externalId: string;
  activityTypeKey: string;
  message: string;
  memberId: string;
  source: Source;
  workspaceId: string;
} & Partial<Activity>;

export const upsertActivity = async (props: Props) => {
  const {
    externalId,
    activityTypeKey,
    message,
    memberId,
    source,
    workspaceId,
    ...data
  } = props;

  const activity = await getActivity({
    externalId,
    workspaceId,
  });

  if (activity) {
    const result = await getActivityTypeByKey({
      key: activityTypeKey,
      workspaceId,
    });

    if (!result) {
      throw new Error(`Activity type ${activityTypeKey} not found`);
    }

    const { activityType, ...data } = activity;

    await updateActivity({
      ...data,
      activityTypeId: activityType.id,
    });
  } else {
    await createActivity({
      externalId,
      activityTypeKey,
      message,
      memberId,
      source,
      workspaceId,
      ...data,
    });
  }
};
