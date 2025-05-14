import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { prisma } from "@conquest/db/prisma";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createManyIssues } from "../github/createManyIssues";
import { createManyPullRequests } from "../github/createManyPullRequests";
import { createTokenManager } from "../github/createTokenManager";
import { createWebhook } from "../github/createWebhook";
import { listStargazers } from "../github/listStargazers";
import { checkDuplicates } from "./checkDuplicates";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installGithub = schemaTask({
  id: "install-github",
  machine: "small-2x",
  schema: z.object({
    github: GithubIntegrationSchema,
  }),
  run: async ({ github }) => {
    const { workspaceId } = github;

    const tokenManager = await createTokenManager(github);

    await createWebhook(tokenManager);
    await listStargazers(tokenManager);
    await createManyIssues(tokenManager);
    await createManyPullRequests(tokenManager);

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
      data: { status: "FAILED" },
    });
  },
});
