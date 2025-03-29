import { createClient } from "@clickhouse/client";
import { env } from "@conquest/env";

export const client = createClient({
  url: env.CLICKHOUSE_URL,
  username: env.CLICKHOUSE_USER,
  password: env.CLICKHOUSE_PASSWORD,
  clickhouse_settings: {
    max_execution_time: 1000 * 60 * 5,
    send_timeout: 1000 * 60 * 5,
  },
});
