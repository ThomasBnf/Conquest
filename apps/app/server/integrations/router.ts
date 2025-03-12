import { router } from "../trpc";
import { deleteIntegration } from "./deleteIntegration";
import { getIntegrationBySource } from "./getIntegrationBySource";
import { getRun } from "./getRun";
import { listIntegrations } from "./listIntegrations";
import { updateIntegration } from "./updateIntegration";

export const integrationsRouter = router({
  list: listIntegrations,
  bySource: getIntegrationBySource,
  update: updateIntegration,
  delete: deleteIntegration,
  getRun: getRun,
});
