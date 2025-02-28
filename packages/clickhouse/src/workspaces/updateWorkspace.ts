import type { Workspace } from "@conquest/zod/schemas/workspace.schema";
import { client } from "../client";

type Props = {
  id: string;
  data: Omit<Partial<Workspace>, "updated_at">;
};

export const updateWorkspace = async ({ id, data }: Props) => {
  const updateFields = Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE workspaces
      UPDATE 
        ${updateFields},
        updated_at = now()
      WHERE id = '${id}'
    `,
  });
};
