import { router } from "../trpc";
import { ignoreDuplicate } from "./ignoreDuplicate";
import { listDuplicate } from "./listDuplicate";
import { mergeMembers } from "./mergeMembers";

export const duplicateRouter = router({
  list: listDuplicate,
  merge: mergeMembers,
  ignore: ignoreDuplicate,
});
