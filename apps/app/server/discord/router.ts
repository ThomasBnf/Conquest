import { router } from "../trpc";
import { listChannels } from "./listChannels";

export const discordRouter = router({
  listChannels,
});
