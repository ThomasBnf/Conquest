import { router } from "@/server/trpc";
import { createLevel } from "./createLevel";
import { deleteLevel } from "./deleteLevel";
import { listLevels } from "./listLevels";
import { updateLevel } from "./updateLevel";

export const levelsRouter = router({
  list: listLevels,
  post: createLevel,
  update: updateLevel,
  delete: deleteLevel,
});
