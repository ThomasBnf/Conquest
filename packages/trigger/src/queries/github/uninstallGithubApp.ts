import { env } from "@conquest/env";
import { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";

type Props = {
  github: GithubIntegration;
};

export const uninstallGithubApp = async ({ github }: Props) => {
  const { details } = github;
  const { installation_id } = details;

  if (!installation_id) {
    throw new Error("Installation ID is required");
  }

  try {
    const auth = createAppAuth({
      appId: env.GITHUB_APP_ID,
      privateKey: "SHA256:eb35KyShlT2+Hvr4AeGzdKVWT87TGXkW6m4GLgJ1b7o=",
    });

    const appAuthentication = await auth({ type: "app" });

    const octokit = new Octokit({
      auth: appAuthentication.token,
    });

    await octokit.request(`DELETE /app/installations/${installation_id}`, {
      installation_id,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};
