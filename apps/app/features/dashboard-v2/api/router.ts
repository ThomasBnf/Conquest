import { router } from "@/server/trpc";
import { activeMembers } from "./active-members";
import { activityTypesByChannel } from "./activity-type-channel";
import { engagementRate } from "./engagement-rate";
import { leaderboard } from "./leaderboard";
import { levelRepartition } from "./level-repartition";
import { newMembers } from "./new-members";
import { totalMembers } from "./total-members";

export const dashboardV2Router = router({
  total: totalMembers,
  active: activeMembers,
  new: newMembers,
  engagement: engagementRate,
  topActivityTypes: activityTypesByChannel,
  leaderboard,
  levelRepartition: levelRepartition,
});
