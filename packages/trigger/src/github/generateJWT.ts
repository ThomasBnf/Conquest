import { env } from "@conquest/env";
import jwt from "jsonwebtoken";

export function generateJWT(): string {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iat: now,
    exp: now + 600,
    iss: env.GITHUB_APP_ID,
  };

  const token = jwt.sign(payload, env.GITHUB_PRIVATE_KEY, {
    algorithm: "RS256",
  });

  return token;
}
