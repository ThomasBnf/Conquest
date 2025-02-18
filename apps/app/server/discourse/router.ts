import { router } from "../trpc";
import { listChannels } from "./listChannels";

export const discourseRouter = router({
  listChannels,
});
