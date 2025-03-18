import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";
import { z } from "zod";
import { createManyIssues } from "../queries/createManyIssues";

export const installGithub = schemaTask({
  id: "install-github",
  machine: "small-2x",
  schema: z.object({
    github: GithubIntegrationSchema,
  }),
  run: async ({ github }) => {
    const { details } = github;
    const { access_token, iv } = details;

    const decryptedToken = await decrypt({ access_token, iv });
    const octokit = new Octokit({ auth: decryptedToken });

    await createManyIssues({ github, octokit });
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
  // onFailure: async ({ github }) => {
  //   await deleteIntegration({ integration: github });
  // },
});
