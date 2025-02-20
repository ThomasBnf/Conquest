import { router } from "../trpc";
import { getOrganization } from "./getOrganization";

export const livestormRouter = router({
  getOrganization,
});
