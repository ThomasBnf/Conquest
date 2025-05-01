import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { Endpoints } from "@octokit/types";
import { Octokit } from "octokit";
import { protectedProcedure } from "../trpc";

type Repository = Endpoints["GET /user/repos"]["response"]["data"][number];

export const listRepositories = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const github = GithubIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Github",
        workspaceId,
      }),
    );

    const { details } = github;
    const { accessToken, accessTokenIv, installationId } = details;

    const token = await decrypt({ accessToken, iv: accessTokenIv });

    const octokit = new Octokit({ auth: token });

    const repositories: Repository[] = [];

    let page = 1;

    while (true) {
      const { data } =
        await octokit.rest.apps.listInstallationReposForAuthenticatedUser({
          installation_id: installationId,
          per_page: 100,
          sort: "full_name",
          direction: "asc",
          page,
        });

      repositories.push(...data.repositories);

      if (data.repositories.length < 100) break;
      page++;
    }

    return repositories;
  },
);
