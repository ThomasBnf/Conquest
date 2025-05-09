export interface AppTokenResponse {
  token: string;
  expiresAt: string;
}

export const getAppToken = async (
  jwt: string,
  installationId: string,
): Promise<AppTokenResponse> => {
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  const data = await response.json();
  console.log(data);

  return {
    token: data.token,
    expiresAt: data.expires_at,
  };
};
