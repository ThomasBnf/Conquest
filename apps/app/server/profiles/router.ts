import { router } from "../trpc";
import { getAllProfiles } from "./getAllProfiles";
import { getProfile } from "./getProfile";
import { updateProfile } from "./updateProfile";

export const profilesRouter = router({
  getAllProfiles,
  getProfile,
  updateProfile,
});
