import { env } from "@conquest/env";
import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: env.SENTRY_DSN,
  });
}
