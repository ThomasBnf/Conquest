import { router } from "../trpc";
import { createActivity } from "./createActivity";
import { deleteActivity } from "./deleteActivity";
import { getActivity } from "./getActivity";
import { listActivities } from "./listActivities";
import { listDayActivities } from "./listDayActivities";
import { listInfiniteActivities } from "./listInfiniteActivities";

export const activitiesRouter = router({
  list: listActivities,
  listInfinite: listInfiniteActivities,
  post: createActivity,
  get: getActivity,
  delete: deleteActivity,
  listDayActivities: listDayActivities,
});
