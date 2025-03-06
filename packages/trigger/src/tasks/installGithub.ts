import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installGithub = schemaTask({
  id: "install-github",
  machine: "small-2x",
  schema: z.object({
    github: GithubIntegrationSchema,
  }),
  run: async ({ github }) => {
    // const { workspace_id } = github;
    // await createManyStargazers({ github });
    // await createManyIssues({ github });
    // await createManyPullRequests({ github });
    // let pagePR = 1;
    // const pullRequests: PullRequest[] = [];
    // while (true) {
    //   const { data } = await octokit.rest.pulls.list({
    //     owner,
    //     repo,
    //     state: "all",
    //     per_page: 100,
    //     page: pagePR,
    //   });
    //   pullRequests.push(...data);
    //   if (data.length < 100) break;
    //   pagePR++;
    // }
    // let pageIssues = 1;
    // const issues: Issue[] = [];
    // while (true) {
    //   const { data } = await octokit.rest.issues.listForRepo({
    //     owner,
    //     repo,
    //     state: "all",
    //     per_page: 100,
    //     page: pageIssues,
    //   });
    //   issues.push(...data);
    //   if (data.length < 100) break;
    //   pageIssues++;
    // }
    // for (const issue of issues) {
    //   const { data: comments } = await octokit.rest.issues.listComments({
    //     owner,
    //     repo,
    //     issue_number: issue.number,
    //   });
    //   console.log(issue.id, comments.length);
    // }
    // console.log(issues.length);
    // await getAllMembersMetrics.trigger({ workspace_id });
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
