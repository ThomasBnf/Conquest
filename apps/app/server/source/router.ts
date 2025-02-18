import { router } from "../trpc";
import { getAllSources } from "./getAllSources";

export const sourceRouter = router({
  getAllSources,
});
