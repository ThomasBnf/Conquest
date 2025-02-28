import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const listLists = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM lists
      WHERE workspace_id = '${workspace_id}'
    `,
  });

  const { data } = await result.json();
  return ListSchema.array().parse(data);
};
