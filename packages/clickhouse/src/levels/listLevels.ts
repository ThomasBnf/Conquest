import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const listLevels = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM levels
      WHERE workspace_id = '${workspace_id}'
    `,
  });

  const { data } = await result.json();
  return LevelSchema.array().parse(data);
};
