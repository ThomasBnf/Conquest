import { router } from "../trpc";
import { activeMembers } from "./activeMembers";
import { activeMembersTable } from "./activeMembersTable";
import { atRiskMembers } from "./atRiskMembers";
import { atRiskMembersTable } from "./atRiskMembersTable";
import { churnRate } from "./churnRate";
import { engagementRate } from "./engagementRate";
import { heatmap } from "./heatmap";
import { newMembers } from "./newMembers";
import { newMembersTable } from "./newMembersTable";
import { potentialAmbassadors } from "./potentialAmbassadors";
import { potentialAmbassadorsTable } from "./potentialAmbassadorsTable";
import { topActivityType } from "./topActivityType";
import { topChannels } from "./topChannels";
import { totalMembers } from "./totalMembers";

export const dashboardRouter = router({
  totalMembers,
  newMembers,
  newMembersTable,
  activeMembers,
  activeMembersTable,
  engagementRate,
  atRiskMembers,
  atRiskMembersTable,
  potentialAmbassadors,
  potentialAmbassadorsTable,
  churnRate,
  topActivityType,
  topChannels,
  heatmap,
});
