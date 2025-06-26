import { createClient } from "@clickhouse/client";
import { env } from "@conquest/env";

export const client = createClient({
  url: env.CLICKHOUSE_URL,
  username: env.CLICKHOUSE_USER,
  password: env.CLICKHOUSE_PASSWORD,
  database: env.CLICKHOUSE_DB,
  request_timeout: 60 * 1000,
});
