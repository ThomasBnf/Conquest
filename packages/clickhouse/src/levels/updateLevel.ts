import type { Level } from "@conquest/zod/schemas/level.schema";
import { client } from "../client";

type Props = { id: string } & Partial<Level>;

export const updateLevel = async (props: Props) => {
  const { id, workspace_id, updated_at, ...data } = props;
  const values = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE level
      UPDATE ${values}, updated_at = now()
      WHERE id = '${id}'
    `,
  });
};
