import type { Log } from "@conquest/zod/schemas/logs.schema";
import { client } from "../client";

type Props = {
  logs: Log[];
};

export const createManyLogs = async ({ logs }: Props) => {
  await client.insert({
    table: "log",
    values: [logs],
    format: "JSON",
  });
};
