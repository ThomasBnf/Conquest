import { router } from "../trpc";
import { activeMembers } from "./activeMembers";
import { atRiskMembers } from "./atRiskMembers";
import { engagementRate } from "./engagementRate";
import { newMembers } from "./newMembers";
import { totalMembers } from "./totalMembers";
import { totalMembersBySource } from "./totalMembersBySource";

export const dashboardRouter = router({
  totalMembers,
  newMembers,
  activeMembers,
  engagementRate,
  totalMembersBySource,
  atRiskMembers,
});
