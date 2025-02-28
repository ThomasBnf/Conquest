import type { Source } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { client } from "../client";

type Props = {
  source?: Source;
  workspace_id: string;
};

export const listChannels = async ({ source, workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT * 
      FROM channels
      WHERE 
        workspace_id = '${workspace_id}'
        ${source ? `AND source = '${source}'` : ""}
      ORDER BY created_at DESC
    `,
  });

  const { data } = await result.json();
  return ChannelSchema.array().parse(data);
};
