import { router } from "@/server/trpc";
import { createTag } from "./createTag";
import { deleteTag } from "./deleteTag";
import { getAllTags } from "./getAllTags";
import { updateTag } from "./updateTag";

export const tagsRouter = router({
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
});
