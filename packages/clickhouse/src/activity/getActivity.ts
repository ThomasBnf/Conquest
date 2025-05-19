import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { client } from "../client";

type Props =
  | {
      externalId: string;
      workspaceId: string;
    }
  | {
      id: string;
    };

export const getActivity = async (props: Props) => {
  const params: Record<string, string> = {};
  let where = "";

  if ("externalId" in props) {
    const { externalId, workspaceId } = props;
    params.externalId = externalId;
    params.workspaceId = workspaceId;
    where = `externalId = '${externalId}' AND workspaceId = '${workspaceId}'`;
  } else {
    const { id } = props;
    params.id = id;
    where = `id = '${id}'`;
  }

  const result = await client.query({
    query: `
     SELECT 
        a.*,
        at.id as "activityType.id",
        at.name as "activityType.name",
        at.key as "activityType.key",
        at.points as "activityType.points",
        at.conditions as "activityType.conditions",
        at.deletable as "activityType.deletable",
        at.source as "activityType.source",
        at.workspaceId as "activityType.workspaceId",
        at.createdAt as "activityType.createdAt",
        at.updatedAt as "activityType.updatedAt"
      FROM activity a
      LEFT JOIN activityType at ON a.activityTypeId = at.id
      WHERE ${where}
    `,
  });

  const { data } = await result.json();

  if (!data?.length) return null;

  const transformFlatActivity = (row: Record<string, unknown>) => {
    if (!row || typeof row !== "object") return null;

    const result: Record<string, unknown> = {};
    const activityType: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (key.startsWith("activityType.")) {
        const cleanKey = key.substring(13);
        activityType[cleanKey] = value;
      } else {
        result[key] = value;
      }
    }

    if (!activityType.id || !activityType.source || !activityType.workspaceId) {
      return null;
    }

    result.activityType = activityType;
    return result;
  };

  const firstRow = data[0];
  if (!firstRow) return null;

  const parsedActivity = transformFlatActivity(
    firstRow as Record<string, unknown>,
  );

  if (!parsedActivity) return null;
  return ActivityWithTypeSchema.parse(parsedActivity);
};
