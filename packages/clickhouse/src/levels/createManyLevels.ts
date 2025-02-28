import type { LEVEL } from "@conquest/zod/schemas/level.schema";
import { client } from "../client";

type Props = {
  levels: LEVEL[];
  workspace_id: string;
};

export const createManyLevels = async ({ levels, workspace_id }: Props) => {
  const values = levels.map((level) => ({
    ...level,
    workspace_id,
  }));

  await client.insert({
    table: "levels",
    values,
    format: "JSONEachRow",
  });
};
