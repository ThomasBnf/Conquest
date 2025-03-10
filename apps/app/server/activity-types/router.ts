import { router } from "@/server/trpc";
import { createActivityType } from "./createActivityType";
import { createManyActivityTypes } from "./createManyActivityTypes";
import { deleteActivityType } from "./deleteActivityType";
import { listActivityTypes } from "./listActivityTypes";
import { updateActivityType } from "./updateActivityType";

export const activityTypesRouter = router({
  list: listActivityTypes,
  post: createActivityType,
  postMany: createManyActivityTypes,
  update: updateActivityType,
  delete: deleteActivityType,
});
