import { env } from "@conquest/env";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  enabled: process.env.NODE_ENV === "production",
  dsn: env.SENTRY_DSN,
});
