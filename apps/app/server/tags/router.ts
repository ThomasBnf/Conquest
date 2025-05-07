import { router } from "@/server/trpc";
import { createTag } from "./createTag";
import { deleteTag } from "./deleteTag";
import { listTags } from "./listTags";
import { updateTag } from "./updateTag";
import { createTagOptimistic } from "./createTagOptimistic";

export const tagsRouter = router({
  list: listTags,
  post: createTag,
  postOptimistic: createTagOptimistic,
  update: updateTag,
  delete: deleteTag,
});
