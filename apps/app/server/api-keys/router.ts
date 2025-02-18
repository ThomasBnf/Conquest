import { router } from "@/server/trpc";
import { createApiKey } from "./createApiKey";
import { deleteApiKey } from "./deleteApiKey";
import { getAll } from "./getAll";

export const apiKeysRouter = router({
  getAll,
  createApiKey,
  deleteApiKey,
});
