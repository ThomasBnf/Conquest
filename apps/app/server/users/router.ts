import { router } from "../trpc";
import { completeOnboarding } from "./completeOnboarding";
import { getCurrentUser } from "./getCurrentUser";
import { getUser } from "./getUser";
import { updateUser } from "./updateUser";

export const usersRouter = router({
  getCurrentUser: getCurrentUser,
  get: getUser,
  update: updateUser,
  completeOnboarding,
});
