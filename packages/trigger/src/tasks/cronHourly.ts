import { client } from "@conquest/clickhouse/client";
import { getPulseAndLevel } from "@conquest/clickhouse/members/getPulseAndLevel";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { endOfHour, format, startOfHour, subHours } from "date-fns";
import { checkDuplicates } from "./checkDuplicates";

export const cronHourly = schedules.task({
  id: "cron-hourly",
  cron: "0 * * * *",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    await client.query({ query: "OPTIMIZE TABLE member FINAL;" });
    await client.query({ query: "OPTIMIZE TABLE profile FINAL;" });

    const now = new Date();
    const start = startOfHour(subHours(now, 1));
    const end = endOfHour(subHours(now, 1));

    const startFormatted = format(start, "yyyy-MM-dd HH:mm:ss");
    const endFormatted = format(end, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
      SELECT DISTINCT memberId
      FROM activity
      WHERE createdAt >= '${startFormatted}'
      AND createdAt <= '${endFormatted}'
      `,
    });

    const { data } = await result.json();
    const members = data as Array<{ memberId: string }>;

    for (const member of members) {
      logger.info("member", { member });

      await getPulseAndLevel({ memberId: member.memberId });
    }

    await checkDuplicates.trigger({});
  },
});
