import { schedules } from "@trigger.dev/sdk/v3";
import { atRisksMembers } from "../at-risks-members";
import { potentialAmbassadors } from "../potential-ambassadors";
import { updatePulseScore } from "../updatePulseScore";

export const cronHourly = schedules.task({
  id: "cron-hourly",
  cron: "0 * * * *",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    await updatePulseScore();
    await atRisksMembers();
    await potentialAmbassadors();

    // await checkDuplicates.trigger({});
  },
});
