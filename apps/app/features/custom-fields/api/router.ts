import { router } from "@/server/trpc";
import { createField } from "./createField";
import { deleteField } from "./deleteField";
import { listFields } from "./listFields";
import { updateField } from "./updateField";

export const customFieldsRouter = router({
  create: createField,
  list: listFields,
  update: updateField,
  delete: deleteField,
});
