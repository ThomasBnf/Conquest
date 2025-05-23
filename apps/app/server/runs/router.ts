import { router } from "@/server/trpc";
import { countRuns } from "./countRuns";
import { getFailedRun } from "./getFailedRun";
import { getRun } from "./getRun";
import { listRuns } from "./listRuns";

export const runsRouter = router({
  list: listRuns,
  count: countRuns,
  get: getRun,
  getFailedRun: getFailedRun,
});
