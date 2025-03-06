import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const getLevelById = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM level
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return LevelSchema.parse(data[0]);
};
