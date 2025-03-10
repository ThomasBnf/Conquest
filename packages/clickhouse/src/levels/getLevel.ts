import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { client } from "../client";

type Props = {
  pulse: number;
  workspace_id: string;
};

export const getLevel = async ({ pulse, workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * FROM level
      WHERE ${pulse} >= from AND ${pulse} <= to
      AND workspace_id = '${workspace_id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return null;
  return LevelSchema.parse(data[0]);
};
