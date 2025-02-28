import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const getList = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * FROM lists 
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();

  if (!data.length) return undefined;
  return ListSchema.parse(data[0]);
};
