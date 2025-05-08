import { decrypt } from "@conquest/db/utils/decrypt";
import { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { addSeconds, subMinutes } from "date-fns";
import { getRefreshToken } from "./getRefreshToken";

export type TokenManager = {
  getToken: () => Promise<string>;
  getGithub: () => GithubIntegration;
};

export const createTokenManager = async (initialGithub: GithubIntegration) => {
  const { details, updatedAt } = initialGithub;
  const { accessToken, accessTokenIv, expiresIn } = details;

  const decrypted = await decrypt({
    accessToken,
    iv: accessTokenIv,
  });

  let github = initialGithub;
  let token = decrypted;

  let expiresAt = addSeconds(new Date(updatedAt), expiresIn);

  const getToken = async (): Promise<string> => {
    const shouldRefresh = subMinutes(expiresAt, 5) < new Date();

    if (shouldRefresh) {
      const { accessToken: newToken, refreshGithub } = await getRefreshToken({
        github,
      });
      github = refreshGithub;
      token = newToken;
      expiresAt = addSeconds(new Date(), expiresIn);
    }

    return token;
  };

  const getGithub = () => github;

  return { getToken, getGithub };
};
