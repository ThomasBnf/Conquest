import { getIntegrationBySource } from "@conquest/clickhouse/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/clickhouse/utils/decrypt";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { Octokit } from "octokit";
import { protectedProcedure } from "../trpc";

export const listRepositories = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const github = GithubIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Github",
        workspace_id,
      }),
    );

    const { details } = github;
    const { access_token, iv } = details;

    const token = await decrypt({ access_token, iv });

    const octokit = new Octokit({ auth: token });

    const { data } = await octokit.rest.repos.listForAuthenticatedUser();

    return data;
  },
);
