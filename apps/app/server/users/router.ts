import { router } from "../trpc";
import { getCurrentUser } from "./getCurrentUser";
import { updateUser } from "./updateUser";

export const usersRouter = router({
  getCurrentUser,
  updateUser,
});
