import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { client } from "../client";

type Props = {
  workspaceId: string;
};

export const listLevels = async ({ workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM level
      WHERE workspaceId = '${workspaceId}'
      ORDER BY number DESC
    `,
  });

  const { data } = await result.json();
  return LevelSchema.array().parse(data);
};
