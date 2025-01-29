import { deleteIntegration } from "@conquest/db/queries/integrations/deleteIntegration";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";
import { z } from "zod";
import { calculateMembersLevel } from "./calculateMembersLevel.trigger";

export const installGithub = schemaTask({
  id: "install-github",
  machine: "small-2x",
  schema: z.object({
    github: GithubIntegrationSchema,
    repos: z.array(z.string()),
  }),
  run: async ({ github, repos }) => {
    const { access_token } = github.details;
    const octokit = new Octokit({ auth: access_token });

    const { data: user } = await octokit.rest.users.getAuthenticated();

    for (const repo of repos) {
      const { data } = await octokit.rest.activity.listStargazersForRepo({
        owner: user.login,
        repo: String(repo),
        per_page: 100,
        page: 1,
      });

      for (const stargazer of data ?? []) {
        // const stargazerData = await octokit.rest.users.getByUsername({
        //   username: stargazer.login,
        // });
      }
    }
  },
  onSuccess: async ({ github }) => {
    console.log(usage.getCurrent());

    await deleteIntegration({
      source: "GITHUB",
      integration: github,
    });
  },
  onFailure: async ({ github }) => {
    const { workspace_id } = github;

    await deleteIntegration({
      source: "GITHUB",
      integration: github,
    });

    await calculateMembersLevel.trigger({ workspace_id });
  },
});
