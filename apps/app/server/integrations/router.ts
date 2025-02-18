import { router } from "../trpc";
import { deleteIntegration } from "./deleteIntegration";
import { getIntegrationBySource } from "./getIntegrationBySource";
import { updateIntegration } from "./updateIntegration";

export const integrationsRouter = router({
  getIntegrationBySource,
  updateIntegration,
  deleteIntegration,
});
