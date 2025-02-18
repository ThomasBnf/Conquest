import { router } from "../trpc";
import { createManyChannels } from "./createManyChannels";
import { getAllChannels } from "./getAllChannels";
import { getChannel } from "./getChannel";

export const channelsRouter = router({
  createManyChannels,
  getAllChannels,
  getChannel,
});
