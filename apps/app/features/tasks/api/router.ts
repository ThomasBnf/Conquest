import { router } from "@/server/trpc";
import { createTask } from "./createTask";
import { deleteTask } from "./deleteTask";
import { getTask } from "./getTask";
import { listTaks } from "./listTaks";
import { updateTask } from "./updateTask";

export const tasksRouter = router({
  list: listTaks,
  post: createTask,
  update: updateTask,
  delete: deleteTask,
  get: getTask,
});
