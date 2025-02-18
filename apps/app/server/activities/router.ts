import { router } from "../trpc";
import { createActivity } from "./createActivity";
import { deleteActivity } from "./deleteActivity";
import { getActivity } from "./getActivity";
import { getAllActivities } from "./getAllActivities";
import { getCompanyActivities } from "./getCompanyActivities";
import { getMemberActivities } from "./getMemberActivities";
import { getMemberActivitiesCount } from "./getMemberActivitiesCount";

export const activitiesRouter = router({
  createActivity,
  getAllActivities,
  getMemberActivities,
  getCompanyActivities,
  getMemberActivitiesCount,
  getActivity,
  deleteActivity,
});
