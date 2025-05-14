import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { encrypt } from "@conquest/db/utils/encrypt";
import {
  GithubIntegration,
  GithubIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { generateToken } from "./generateToken";

export type TokenManager = {
  getToken: () => Promise<string>;
  getGithub: () => GithubIntegration;
};

export const createTokenManager = async (initialGithub: GithubIntegration) => {
  const { details } = initialGithub;
  const { token, tokenIv, expiresAt, installationId } = details;

  const decryptedToken = await decrypt({
    accessToken: token,
    iv: tokenIv,
  });

  let accessToken = decryptedToken;
  let github = initialGithub;

  const getToken = async (): Promise<string> => {
    // const shouldRefresh = subMinutes(expiresAt, 5) < new Date();
    const shouldRefresh = true;

    if (shouldRefresh) {
      const response = await generateToken(installationId);
      const data = await response.json();

      const { token, expires_at } = data;

      const encryptedToken = await encrypt(token);

      const integration = await updateIntegration({
        id: github.id,
        details: {
          ...initialGithub.details,
          token: encryptedToken.token,
          tokenIv: encryptedToken.iv,
          expiresAt: expires_at,
        },
        workspaceId: github.workspaceId,
      });

      const parsedIntegration = GithubIntegrationSchema.parse(integration);
      github = parsedIntegration;

      accessToken = token;
    }

    return accessToken;
  };

  const getGithub = () => github;

  return { getToken, getGithub };
};
