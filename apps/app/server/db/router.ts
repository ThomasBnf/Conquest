import { router } from "../trpc";
import { seed } from "./seed";

export const dbRouter = router({
  seed,
});
