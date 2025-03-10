import { router } from "../trpc";
import { getLink } from "./getLink";
import { listRepositories } from "./listRepositories";

export const githubRouter = router({
  listRepositories,
  getLink,
});
