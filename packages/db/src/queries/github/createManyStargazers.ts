import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { type Stargazer, StargazerSchema } from "@conquest/zod/types/github";
import { Octokit } from "octokit";
import { createMember } from "../member/createMember";

type Props = {
  github: GithubIntegration;
};

export const createManyStargazers = async ({ github }: Props) => {
  const { workspace_id, details } = github;
  const { access_token, owner, name: repoName } = details;

  const octokit = new Octokit({ auth: access_token });

  let page = 1;
  const stargazers: Stargazer[] = [];

  while (true) {
    const { data } = await octokit.rest.activity.listStargazersForRepo({
      owner,
      repo: repoName,
      page,
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        accept: "application/vnd.github+json",
      },
    });

    const parsedData = StargazerSchema.array().parse(data);
    stargazers.push(...parsedData);

    if (data.length === 100) break;
    page++;
  }

  for (const stargazer of stargazers) {
    const { login: username } = stargazer;

    const { data } = await octokit.rest.users.getByUsername({
      username,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        accept: "application/vnd.github+json",
      },
    });

    const {
      id,
      login,
      avatar_url,
      email,
      bio,
      blog,
      company,
      followers,
      location,
      name,
      twitter_username,
    } = data;

    if (company) {
      try {
        const { data } = await octokit.rest.orgs.get({
          org: company,
        });

        console.log("org", data);
      } catch (error) {
        console.log(error);
      }
    }

    const firstName = name?.split(" ")[0] ?? null;
    const lastName = name?.split(" ")[1] ?? null;

    const member = await createMember({
      data: {
        first_name: firstName,
        last_name: lastName,
        primary_email: email,
        avatar_url,
      },
      source: "GITHUB",
      workspace_id,
    });

    // await upsertProfile({
    //   attributes: GithubAttributesSchema.parse({
    //     source: "GITHUB",
    //     github_id: id,
    //     github_username: login,
    //     bio,
    //     blog,
    //     followers,
    //     location,
    //   }),
    //   source: "GITHUB",
    //   member_id: member.id,
    //   workspace_id,
    // });

    // if (twitter_username) {
    //   await upsertProfile({
    //     attributes: XAttributesSchema.parse({
    //       source: "X",
    //       x_id: null,
    //       username: twitter_username,
    //     }),
    //     source: "X",
    //     member_id: member.id,
    //     workspace_id,
    //   });
    // }

    // await createActivity({
    //   activity_type_key: "github:star",
    //   message: `Starred ${repoName}`,
    //   member_id: member.id,
    //   workspace_id,
    // });
  }
};
