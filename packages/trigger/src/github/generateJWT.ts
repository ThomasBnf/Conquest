import { env } from "@conquest/env";
import jwt from "jsonwebtoken";

export const generateJWT = () => {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iat: now,
    exp: now + 600,
    iss: env.GITHUB_APP_ID,
  };

  const formattedPrivateKey = env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n");

  const token = jwt.sign(payload, formattedPrivateKey, {
    algorithm: "RS256",
  });

  return token;
};
