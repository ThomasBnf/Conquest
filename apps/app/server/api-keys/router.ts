import { router } from "@/server/trpc";
import { createApiKey } from "./createApiKey";
import { deleteApiKey } from "./deleteApiKey";
import { listApiKeys } from "./listApiKeys";

export const apiKeysRouter = router({
  list: listApiKeys,
  post: createApiKey,
  delete: deleteApiKey,
});
