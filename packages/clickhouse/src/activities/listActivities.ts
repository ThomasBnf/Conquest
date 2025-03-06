import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { format, startOfDay, subDays } from "date-fns";
import { client } from "../client";

type Props = {
  period?: number;
  member_id?: string;
  company_id?: string;
  workspace_id: string;
};

export const listActivities = async ({
  period,
  member_id,
  company_id,
  workspace_id,
}: Props) => {
  const today = new Date();
  const to = startOfDay(subDays(today, period ?? 0));

  const result = await client.query({
    query: `
      SELECT 
        a.*,
        activity_type.*
      FROM activity a
      LEFT JOIN activity_type ON a.activity_type_id = activity_type.id
      ${company_id ? "LEFT JOIN member m ON a.member_id = m.id" : ""}
      WHERE a.workspace_id = '${workspace_id}'
      ${member_id ? `AND a.member_id = '${member_id}'` : ""}
      ${company_id ? `AND m.company_id = '${company_id}'` : ""}
      ${period ? `AND a.created_at BETWEEN '${format(to, "yyyy-MM-dd HH:mm:ss")}' AND '${format(today, "yyyy-MM-dd HH:mm:ss")}'` : ""}
      ORDER BY a.created_at DESC
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
  );

  if (!data?.length) return [];
  return ActivityWithTypeSchema.array().parse(activities);
};
