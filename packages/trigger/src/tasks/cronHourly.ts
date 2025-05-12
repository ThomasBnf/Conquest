import { client } from "@conquest/clickhouse/client";
import { schedules } from "@trigger.dev/sdk/v3";
import { atRisksMembers } from "../at-risks-members";
import { updatePulseScore } from "../updatePulseScore";
import { checkDuplicates } from "./checkDuplicates";

export const cronHourly = schedules.task({
  id: "cron-hourly",
  cron: "0 * * * *",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    await client.query({ query: "OPTIMIZE TABLE member FINAL;" });
    await client.query({ query: "OPTIMIZE TABLE profile FINAL;" });

    await updatePulseScore();
    await atRisksMembers();
    await checkDuplicates.trigger({});
  },
});
