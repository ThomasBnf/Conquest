import type { Source } from "@conquest/zod/enum/source.enum";
import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { randomUUID } from "node:crypto";
import { getActivityTypeByKey } from "../activity-type/getActivityTypeByKey";
import { client } from "../client";
import { getActivity } from "./getActivity";

type Props = {
  activityTypeKey: string;
  source: Source;
  workspaceId: string;
} & Partial<Activity>;

export const createActivity = async (props: Props) => {
  const {
    activityTypeKey,
    activityTypeId,
    workspaceId,
    updatedAt,
    createdAt,
    ...rest
  } = props;

  const activityType = await getActivityTypeByKey({
    key: activityTypeKey,
    workspaceId,
  });

  if (!activityType) throw new Error("Activity type not found");

  const id = randomUUID();

  await client.insert({
    table: "activity",
    values: [
      {
        ...rest,
        id,
        activityTypeId: activityType.id,
        workspaceId,
        updatedAt: updatedAt ?? new Date(),
        createdAt: createdAt ?? new Date(),
      },
    ],
    format: "JSON",
  });

  return await getActivity({ id, workspaceId });
};
