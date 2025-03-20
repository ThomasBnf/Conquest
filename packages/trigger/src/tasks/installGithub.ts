import { createManyIssues } from "@conquest/clickhouse/github/createManyIssues";
import { createWebhook } from "@conquest/clickhouse/github/createWebhook";
import { listStargazers } from "@conquest/clickhouse/github/listStargazers";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";
import { z } from "zod";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installGithub = schemaTask({
  id: "install-github",
  machine: "small-2x",
  schema: z.object({
    github: GithubIntegrationSchema,
  }),
  run: async ({ github }) => {
    const { details, workspace_id } = github;
    const { access_token, iv } = details;

    const decryptedToken = await decrypt({ access_token, iv });
    const octokit = new Octokit({ auth: decryptedToken });

    await createWebhook({ github, octokit });
    await listStargazers({ github, octokit });
    await createManyIssues({ github, octokit });

    await getAllMembersMetrics.trigger(
      { workspace_id },
      { metadata: { workspace_id } },
    );
    await integrationSuccessEmail.trigger({ integration: github });
  },
  onSuccess: async ({ github }) => {
    const { id, workspace_id } = github;

    await updateIntegration({
      id,
      connected_at: new Date(),
      status: "CONNECTED",
      workspace_id,
    });
  },
  onFailure: async ({ github }) => {
    await deleteIntegration({ integration: github });
  },
});
