import { router } from "../trpc";
import { createManyChannels } from "./createManyChannels";
import { getChannel } from "./getChannel";
import { listChannels } from "./listChannels";

export const channelsRouter = router({
  list: listChannels,
  postMany: createManyChannels,
  get: getChannel,
});
