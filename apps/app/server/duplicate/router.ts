import { router } from "../trpc";
import { countDuplicates } from "./countDuplicates";
import { ignoreDuplicate } from "./ignoreDuplicate";
import { listDuplicate } from "./listDuplicate";
import { mergeMembers } from "./mergeMembers";

export const duplicateRouter = router({
  list: listDuplicate,
  count: countDuplicates,
  merge: mergeMembers,
  ignore: ignoreDuplicate,
});
