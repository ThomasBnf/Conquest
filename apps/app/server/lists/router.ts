import { router } from "../trpc";
import { createList } from "./createList";
import { deleteList } from "./deleteList";
import { getList } from "./getList";
import { listLists } from "./listLists";
import { updateList } from "./updateList";

export const listsRouter = router({
  list: listLists,
  post: createList,
  update: updateList,
  get: getList,
  delete: deleteList,
});
