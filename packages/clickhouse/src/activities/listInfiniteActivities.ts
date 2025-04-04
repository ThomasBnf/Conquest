import {
  type ActivityWithType,
  ActivityWithTypeSchema,
} from "@conquest/zod/schemas/activity.schema";
import { client } from "../client";

type Props = {
  cursor?: number | null | undefined;
  member_id?: string;
  company_id?: string;
  workspace_id: string;
};

export const listInfiniteActivities = async ({
  member_id,
  company_id,
  cursor,
  workspace_id,
}: Props) => {
  const result = await client.query({
    query: `
      SELECT 
        a.*,
        at.*
      FROM activity a
      LEFT JOIN activity_type at ON a.activity_type_id = at.id
      ${company_id ? "LEFT JOIN member m FINAL ON a.member_id = m.id" : ""}
      WHERE a.workspace_id = '${workspace_id}'
      ${member_id ? `AND a.member_id = '${member_id}'` : ""}
      ${company_id ? `AND m.company_id = '${company_id}'` : ""}
      ORDER BY a.created_at DESC, a.id DESC
      ${cursor ? `LIMIT 25 OFFSET ${cursor}` : "LIMIT 25"}
    `,
  });

  const { data } = await result.json();
  if (!data?.length) return [];

  const transformFlatActivity = (row: Record<string, unknown>) => {
    const result: Record<string, unknown> = {};
    const activityType: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (key.startsWith("at.")) {
        activityType[key.substring(3)] = value;
      } else if (
        ["name", "key", "points", "conditions", "deletable"].includes(key)
      ) {
        activityType[key] = value;
      } else if (key.startsWith("a.")) {
        result[key.substring(2)] = value;
      } else {
        result[key] = value;
      }
    }

    result.activity_type = activityType;
    return result;
  };

  const activities = data.map((row: unknown) =>
    transformFlatActivity(row as Record<string, unknown>),
  ) as ActivityWithType[];

  return ActivityWithTypeSchema.array().parse(activities);
};
