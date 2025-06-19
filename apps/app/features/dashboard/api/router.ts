import { router } from "@/server/trpc";
import { activeMembers } from "./active-members";
import { engagementRate } from "./engagement-rate";
import { newMembers } from "./new-members";
import { totalMembers } from "./total-members";

export const dashboardRouter = router({
  totalMembers,
  newMembers,
  activeMembers,
  engagementRate,
  // activityTypesByChannel,
  // leaderboard,
  // atRiskMembers,
  // atRiskMembersTable,
  // potentialAmbassadors,
  // potentialAmbassadorsTable,
  // heatmap,
});
