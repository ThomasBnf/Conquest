import type { Log } from "@conquest/zod/schemas/logs.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";

type Props = {
  log: Omit<Log, "id">;
};

export const createLog = async ({ log }: Props) => {
  const id = uuid();

  await client.insert({
    table: "log",
    values: {
      id,
      ...log,
    },
    format: "JSON",
  });
};
