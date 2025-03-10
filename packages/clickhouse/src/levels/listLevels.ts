import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const listLevels = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM level
      WHERE workspace_id = '${workspace_id}'
      ORDER BY number DESC
    `,
  });

  const { data } = await result.json();
  return LevelSchema.array().parse(data);
};
