import { router } from "@/server/trpc";
import { activeMembers } from "./activeMembers";
import { atRiskMembers } from "./atRiskMembers";
import { membersLevels } from "./membersLevels";
import { newMembers } from "./newMembers";
import { potentialAmbassadors } from "./potentialAmbassadors";
import { topActivityTypes } from "./topActivityTypes";
import { topChannels } from "./topChannels";
import { topMembers } from "./topMembers";
import { totalMembers } from "./totalMembers";

export const dashboardRouter = router({
  activeMembers,
  atRiskMembers,
  membersLevels,
  newMembers,
  potentialAmbassadors,
  topActivityTypes,
  topChannels,
  topMembers,
  totalMembers,
});
