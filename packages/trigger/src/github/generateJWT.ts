import { env } from "@conquest/env";
import jwt from "jsonwebtoken";

const formatPrivateKey = (key: string): string => {
  const formattedKey = key
    .replace(
      /-----BEGIN RSA PRIVATE KEY-----/,
      "-----BEGIN RSA PRIVATE KEY-----\n",
    )
    .replace(/-----END RSA PRIVATE KEY-----/, "\n-----END RSA PRIVATE KEY-----")
    .replace(/\s+/g, "\n");

  return formattedKey;
};

export function generateJWT(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 600, // valid for 10 minutes
    iss: env.GITHUB_APP_ID,
  };

  const privateKey = formatPrivateKey(env.GITHUB_PRIVATE_KEY);

  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
  });
  return token;
}
