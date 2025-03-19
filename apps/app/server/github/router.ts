import { router } from "../trpc";
import { listRepositories } from "./listRepositories";

export const githubRouter = router({
  listRepositories,
});
