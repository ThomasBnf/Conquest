import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const getWorkspace = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM workspaces 
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return WorkspaceSchema.parse(data.at(0));
};
