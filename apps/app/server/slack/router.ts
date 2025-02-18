import { router } from "../trpc";
import { getPermaLink } from "./getPermaLink";
import { listChannels } from "./listChannels";

export const slackRouter = router({
  listChannels,
  getPermaLink,
});
