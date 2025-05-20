import { router } from "../trpc";
import { deleteCustomField } from "./deleteCustomField";
import { deleteWorkspace } from "./deleteWorkspace";
import { getSlug } from "./getSlug";
import { getWorkspace } from "./getWorkspace";
import { updateWorkspace } from "./updateWorkspace";

export const workspacesRouter = router({
  get: getWorkspace,
  update: updateWorkspace,
  getSlug,
  delete: deleteWorkspace,
  deleteField: deleteCustomField,
});
