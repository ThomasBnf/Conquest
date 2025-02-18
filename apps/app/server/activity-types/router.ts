import { router } from "@/server/trpc";
import { createActivityType } from "./createActivityType";
import { createManyActivityTypes } from "./createManyActivityTypes";
import { deleteActivityType } from "./deleteActivityType";
import { getAllActivityTypes } from "./getAllActivityTypes";
import { updateActivityType } from "./updateActivityType";

export const activityTypesRouter = router({
  getAllActivityTypes,
  createActivityType,
  createManyActivityTypes,
  updateActivityType,
  deleteActivityType,
});
