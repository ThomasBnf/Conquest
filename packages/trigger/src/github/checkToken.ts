import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import {
  GithubIntegration,
  GithubIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { addSeconds, subMinutes } from "date-fns";
import { getRefreshToken } from "./getRefreshToken";

type Props = {
  github: GithubIntegration;
};

export const checkToken = async ({ github }: Props) => {
  const { workspaceId } = github;

  const githubIntegration = GithubIntegrationSchema.parse(
    await getIntegrationBySource({
      source: "Github",
      workspaceId,
    }),
  );

  const { details, updatedAt } = githubIntegration;
  const { accessToken, accessTokenIv, expiresIn } = details;

  const decryptedToken = await decrypt({ accessToken, iv: accessTokenIv });

  const expiresAt = addSeconds(new Date(updatedAt), expiresIn);
  const shouldRefresh = subMinutes(expiresAt, 5) < new Date();

  let token = decryptedToken;

  if (shouldRefresh) {
    try {
      const { accessToken, refreshGithub } = await getRefreshToken({
        github,
      });

      token = accessToken;
    } catch (error) {
      logger.error("checkToken", { error });
    }
  }

  return token;
};
