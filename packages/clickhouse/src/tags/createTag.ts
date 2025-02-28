import type { Source } from "@conquest/zod/enum/source.enum";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";

type Props = {
  external_id?: string;
  name: string;
  color: string;
  source: Source;
  workspace_id: string;
};

export const createTag = async (props: Props) => {
  const id = uuid();
  const { external_id, name, color, source, workspace_id } = props;

  await client.insert({
    table: "tags",
    values: [
      {
        id,
        external_id,
        name,
        color,
        source,
        workspace_id,
      },
    ],
    format: "JSON",
  });

  const result = await client.query({
    query: `
      SELECT *
      FROM tags 
      WHERE id = '${id}'`,
  });

  const { data } = await result.json();
  return TagSchema.parse(data[0]);
};
