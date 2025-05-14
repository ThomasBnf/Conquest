import { generateJWT } from "./generateJWT";

export const generateToken = async (installationId: number) => {
  const jwt = generateJWT();

  return await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
};
