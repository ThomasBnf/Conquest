import { env } from "@conquest/env";
import jwt from "jsonwebtoken";

const GITHUB_APP_ID = "1186268";

export function generateJWT(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 600, // valide 10 minutes
    iss: GITHUB_APP_ID,
  };

  const token = jwt.sign(payload, env.GITHUB_PRIVATE_KEY, {
    algorithm: "RS256",
  });
  return token;
}
