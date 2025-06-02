import { router } from "../trpc";
import { adminTask } from "./adminTask";

export const adminRouter = router({
  adminTask,
});
