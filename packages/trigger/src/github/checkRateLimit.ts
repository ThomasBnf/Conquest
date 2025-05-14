import type { ResponseHeaders } from "@octokit/types";
import { logger, wait } from "@trigger.dev/sdk/v3";

export const checkRateLimit = async (headers: ResponseHeaders) => {
  const rateLimit = Number(headers["x-ratelimit-remaining"]);
  const rateLimitReset = headers["x-ratelimit-reset"];

  if (rateLimit !== 0) return;

  logger.info("Rate limit atteint, attente jusqu'au reset", {
    resetTime: new Date(Number(rateLimitReset) * 1000),
  });

  await wait.until({ date: new Date(Number(rateLimitReset) * 1000) });
};
