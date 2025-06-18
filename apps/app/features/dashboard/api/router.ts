import { router } from "@/server/trpc";
import { activeMembers } from "./active-members";
import { activityTypesByChannel } from "./activity-type-channel";
import { atRiskMembers } from "./atRiskMembers";
import { atRiskMembersTable } from "./atRiskMembersTable";
import { engagementRate } from "./engagement-rate";
import { heatmap } from "./heatmap";
import { leaderboard } from "./leaderboard";
import { newMembers } from "./new-members";
import { potentialAmbassadors } from "./potentialAmbassadors";
import { potentialAmbassadorsTable } from "./potentialAmbassadorsTable";
import { totalMembers } from "./total-members";

export const dashboardRouter = router({
  totalMembers,
  activeMembers,
  newMembers,
  engagementRate,
  activityTypesByChannel,
  leaderboard,
  atRiskMembers,
  atRiskMembersTable,
  potentialAmbassadors,
  potentialAmbassadorsTable,
  heatmap,
});
