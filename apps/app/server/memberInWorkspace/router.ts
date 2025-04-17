import { router } from "../trpc";
import { listMembersInWorkspace } from "./listMembersInWorkspace";

export const memberInWorkspaceRouter = router({
  list: listMembersInWorkspace,
});
