import { EventSchema } from "@conquest/zod/schemas/event.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const listEvents = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
        SELECT * 
        FROM events 
        WHERE workspace_id = '${workspace_id}'
    `,
  });

  const { data } = await result.json();
  return EventSchema.array().parse(data);
};
