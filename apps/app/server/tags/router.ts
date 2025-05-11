import { router } from "@/server/trpc";
import { createTag } from "./createTag";
import { deleteTag } from "./deleteTag";
import { listTags } from "./listTags";
import { updateTag } from "./updateTag";

export const tagsRouter = router({
  list: listTags,
  post: createTag,
  update: updateTag,
  delete: deleteTag,
});
