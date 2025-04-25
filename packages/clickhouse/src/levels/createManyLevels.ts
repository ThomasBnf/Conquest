import type { LEVEL } from "@conquest/zod/schemas/level.schema";
import { client } from "../client";

type Props = {
  levels: LEVEL[];
  workspaceId: string;
};

export const createManyLevels = async ({ levels, workspaceId }: Props) => {
  const values = levels.map((level) => ({
    ...level,
    workspaceId,
  }));

  await client.insert({
    table: "level",
    values,
    format: "JSON",
  });
};
