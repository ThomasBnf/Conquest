import { env } from "@conquest/env";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
});
