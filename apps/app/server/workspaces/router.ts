import { router } from "../trpc";
import { getSlug } from "./getSlug";
import { getWorkspace } from "./getWorkspace";
import { updateWorkspace } from "./updateWorkspace";

export const workspacesRouter = router({
  getWorkspace,
  getSlug,
  updateWorkspace,
});
