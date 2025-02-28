import { router } from "@/server/trpc";
import { createLevel } from "./createLevel";
import { deleteLevel } from "./deleteLevel";
import { getLevel } from "./getLevel";
import { listLevels } from "./listLevels";
import { updateLevel } from "./updateLevel";

export const levelsRouter = router({
  list: listLevels,
  post: createLevel,
  get: getLevel,
  update: updateLevel,
  delete: deleteLevel,
});
