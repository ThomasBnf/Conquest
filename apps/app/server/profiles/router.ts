import { router } from "../trpc";
import { deleteProfile } from "./deleteProfile";
import { getProfile } from "./getProfile";
import { getProfileBySource } from "./getProfileBySource";
import { listMembersProfiles } from "./listMembersProfiles";
import { listProfiles } from "./listProfiles";
import { updateProfile } from "./updateProfile";

export const profilesRouter = router({
  list: listProfiles,
  members: listMembersProfiles,
  get: getProfile,
  getBySource: getProfileBySource,
  update: updateProfile,
  delete: deleteProfile,
});
