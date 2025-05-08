import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { prisma } from "@conquest/db/prisma";
import { decrypt } from "@conquest/db/utils/decrypt";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";
import { z } from "zod";
import { createManyIssues } from "../github/createManyIssues";
import { createManyPullRequests } from "../github/createManyPullRequests";
import { createWebhook } from "../github/createWebhook";
import { listStargazers } from "../github/listStargazers";
import { checkDuplicates } from "./checkDuplicates";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installGithub = schemaTask({
  id: "install-github",
  machine: "medium-1x",
  schema: z.object({
    github: GithubIntegrationSchema,
  }),
  run: async ({ github }) => {
    const { details, workspaceId } = github;
    const { accessToken, accessTokenIv } = details;

    const decryptedToken = await decrypt({ accessToken, iv: accessTokenIv });
    const octokit = new Octokit({ auth: decryptedToken });

    await createWebhook({ github, octokit });
    await listStargazers({ github, octokit });
    await createManyIssues({ github, octokit });
    await createManyPullRequests({ github, octokit });

    await getAllMembersMetrics.triggerAndWait({ workspaceId });
    await checkDuplicates.triggerAndWait({ workspaceId });
    await integrationSuccessEmail.trigger({ integration: github });
  },
  onSuccess: async ({ github }) => {
    const { id, workspaceId } = github;

    await updateIntegration({
      id,
      connectedAt: new Date(),
      status: "CONNECTED",
      workspaceId,
    });
  },
  onFailure: async ({ github }) => {
    await prisma.integration.update({
      where: { id: github.id },
      data: { status: "DISCONNECTED" },
    });
  },
});
