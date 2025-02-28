import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const listTags = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM tags
      WHERE workspace_id = '${workspace_id}'
      ORDER BY name ASC
    `,
  });

  const { data } = await result.json();
  return TagSchema.array().parse(data);
};
