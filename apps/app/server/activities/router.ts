import { router } from "../trpc";
import { createActivity } from "./createActivity";
import { deleteActivity } from "./deleteActivity";
import { getActivity } from "./getActivity";
import { listActivities } from "./listActivities";
import { listDayActivities } from "./listDayActivities";

export const activitiesRouter = router({
  list: listActivities,
  post: createActivity,
  get: getActivity,
  delete: deleteActivity,
  listDayActivities: listDayActivities,
});
