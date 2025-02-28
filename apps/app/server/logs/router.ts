import { router } from "../trpc";
import { listLogs } from "./listLogs";

export const logsRouter = router({
  list: listLogs,
});
