import { router } from "../trpc";
import { createList } from "./createList";
import { deleteList } from "./deleteList";
import { getAllLists } from "./getAllLists";
import { getList } from "./getList";
import { updateList } from "./updateList";

export const listsRouter = router({
  getAllLists,
  createList,
  updateList,
  getList,
  deleteList,
});
