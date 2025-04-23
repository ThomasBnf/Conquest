import { router } from "../trpc";
import { inviteUsers } from "./inviteUsers";
import { listInvitations } from "./listInvitations";
import { listUsers } from "./listUsers";

export const teamRouter = router({
  list: listUsers,
  invite: inviteUsers,
  invitations: listInvitations,
});
