import { router } from "../trpc";
import { deleteUser } from "./deleteUser";
import { getCurrentUser } from "./getCurrentUser";
import { updateUser } from "./updateUser";

export const usersRouter = router({
  getCurrentUser,
  update: updateUser,
  delete: deleteUser,
});
