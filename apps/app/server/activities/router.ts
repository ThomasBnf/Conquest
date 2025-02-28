import { router } from "../trpc";
import { createActivity } from "./createActivity";
import { deleteActivity } from "./deleteActivity";
import { getActivity } from "./getActivity";
import { listActivities } from "./listActivities";

export const activitiesRouter = router({
  list: listActivities,
  post: createActivity,
  get: getActivity,
  delete: deleteActivity,
});
