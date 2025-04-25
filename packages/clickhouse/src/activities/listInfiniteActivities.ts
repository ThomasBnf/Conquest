import {
  type ActivityWithType,
  ActivityWithTypeSchema,
} from "@conquest/zod/schemas/activity.schema";
import { client } from "../client";

type Props = {
  cursor?: number | null | undefined;
  memberId?: string;
  companyId?: string;
  workspaceId: string;
};

export const listInfiniteActivities = async ({
  memberId,
  companyId,
  cursor,
  workspaceId,
}: Props) => {
  const result = await client.query({
    query: `
      SELECT 
        a.*,
        at.*
      FROM activity a
      LEFT JOIN activityType at ON a.activityTypeId = at.id
      ${companyId ? "LEFT JOIN member m FINAL ON a.memberId = m.id" : ""}
      WHERE a.workspaceId = '${workspaceId}'
      ${memberId ? `AND a.memberId = '${memberId}'` : ""}
      ${companyId ? `AND m.companyId = '${companyId}'` : ""}
      ORDER BY a.createdAt DESC, a.id DESC
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

    result.activityType = activityType;
    return result;
  };

  const activities = data.map((row: unknown) =>
    transformFlatActivity(row as Record<string, unknown>),
  ) as ActivityWithType[];

  return ActivityWithTypeSchema.array().parse(activities);
};
