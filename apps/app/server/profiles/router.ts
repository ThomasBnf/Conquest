import { router } from "../trpc";
import { getProfile } from "./getProfile";
import { getProfileBySource } from "./getProfileBySource";
import { listProfiles } from "./listProfiles";
import { updateProfile } from "./updateProfile";

export const profilesRouter = router({
  list: listProfiles,
  get: getProfile,
  getBySource: getProfileBySource,
  update: updateProfile,
});
