import { router } from "../trpc";
import { listUserWorkspaces } from "./listUserWorkspaces";
import { listWorkspaceUsers } from "./listWorkspaceUsers";

export const userInWorkspaceRouter = router({
  list: listUserWorkspaces,
  listUsers: listWorkspaceUsers,
});
