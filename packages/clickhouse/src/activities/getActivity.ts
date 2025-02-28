import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { client } from "../client";

type Props =
  | {
      external_id: string;
      workspace_id: string;
    }
  | {
      id: string;
    };

export const getActivity = async (props: Props) => {
  const params: Record<string, string> = {};
  let where = "";

  if ("external_id" in props) {
    const { external_id, workspace_id } = props;
    params.external_id = external_id;
    params.workspace_id = workspace_id;
    where = `external_id = '${external_id}' AND workspace_id = '${workspace_id}'`;
  } else {
    const { id } = props;
    params.id = id;
    where = `id = '${id}'`;
  }

  const result = await client.query({
    query: `
      SELECT 
      a.*,
      activity_type.*
      FROM activities a
      LEFT JOIN activity_types activity_type ON a.activity_type_id = activity_type.id
      WHERE ${where}
    `,
  });

  const { data } = await result.json();

  const transformFlatActivity = (row: Record<string, unknown>) => {
    const result: Record<string, unknown> = {};
    const activityType: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (key.startsWith("activity_type.")) {
        activityType[key.substring(14)] = value;
      } else if (
        ["name", "key", "points", "conditions", "deletable"].includes(key)
      ) {
        activityType[key] = value;
      } else {
        result[key] = value;
      }
    }

    result.activity_type = activityType;
    return result;
  };

  const parsedActivity = transformFlatActivity(
    data[0] as Record<string, unknown>,
  );

  if (!data.length) return undefined;
  return ActivityWithTypeSchema.parse(parsedActivity);
};
