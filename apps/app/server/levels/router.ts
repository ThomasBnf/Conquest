import { router } from "@/server/trpc";
import { createLevel } from "./createLevel";
import { deleteLevel } from "./deleteLevel";
import { getAllLevels } from "./getAllLevels";
import { getLevel } from "./getLevel";
import { updateLevel } from "./updateLevel";

export const levelsRouter = router({
  getAllLevels,
  createLevel,
  getLevel,
  updateLevel,
  deleteLevel,
});
