import { batchMergeMembers } from "@conquest/clickhouse/members/batchMergeMembers";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";
import { z } from "zod";
import { createManyIssues } from "../github/createManyIssues";
import { createManyPullRequests } from "../github/createManyPullRequests";
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

    // await createWebhook({ github, octokit });
    // const stargazers = await listStargazers({ github, octokit });
    const issuesMembers = await createManyIssues({ github, octokit });
    const pullRequestsMembers = await createManyPullRequests({
      github,
      octokit,
    });

    const members = [
      // ...stargazers,
      ...issuesMembers,
      ...pullRequestsMembers,
    ];
    const uniqueMembers = members.filter(
      (member, index, self) =>
        index === self.findIndex((t) => t.id === member.id),
    );

    logger.info("members", {
      count: uniqueMembers.length,
      members: uniqueMembers,
    });

    await batchMergeMembers({ members: uniqueMembers });

    await getAllMembersMetrics.triggerAndWait(
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
