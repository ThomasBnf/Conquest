import { client } from "@conquest/clickhouse/client";
import { getMemberMetrics } from "@conquest/clickhouse/members/getMemberMetrics";
import { schedules } from "@trigger.dev/sdk/v3";
import { endOfHour, format, startOfHour, subHours } from "date-fns";

export const cronHourly = schedules.task({
  id: "cron-hourly",
  cron: "0 * * * *",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const now = new Date();
    const start = startOfHour(subHours(now, 1));
    const end = endOfHour(subHours(now, 1));

    const startFormatted = format(start, "yyyy-MM-dd HH:mm:ss");
    const endFormatted = format(end, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT DISTINCT member_id
        FROM activity
        WHERE created_at >= '${startFormatted}'
        AND created_at <= '${endFormatted}'
      `,
    });

    const { data } = await result.json();
    const members = data as Array<{ member_id: string }>;

    await Promise.all(
      members.map(async (member) => {
        await getMemberMetrics({ memberId: member.member_id });
      }),
    );
  },
});
