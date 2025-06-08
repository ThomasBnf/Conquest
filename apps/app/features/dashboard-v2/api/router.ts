import { router } from "@/server/trpc";
import { activeMembers } from "./active-members";
import { levelRepartition } from "./level-repartition";
import { newMembers } from "./new-members";
import { totalMembers } from "./total-members";

export const dashboardV2Router = router({
  total: totalMembers,
  active: activeMembers,
  new: newMembers,
  levelRepartition: levelRepartition,
});
