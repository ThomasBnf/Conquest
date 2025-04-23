import { router } from "../trpc";
import { listUsersInWorkspace } from "./listUsersInWorkspace";

export const userInWorkspaceRouter = router({
  list: listUsersInWorkspace,
});
