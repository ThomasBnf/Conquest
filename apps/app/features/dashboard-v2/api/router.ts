import { router } from "@/server/trpc";
import { totalMembers } from "./total-members";

export const dashboardV2Router = router({
  totalMembers,
});
