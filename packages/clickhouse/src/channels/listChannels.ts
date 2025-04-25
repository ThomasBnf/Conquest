import type { Source } from "@conquest/zod/enum/source.enum";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { client } from "../client";

type Props = {
  source?: Source;
  workspaceId: string;
};

export const listChannels = async ({ source, workspaceId }: Props) => {
  const channels = await client.query({
    query: `
      SELECT *
      FROM channel
      WHERE workspaceId = '${workspaceId}'
      ${source ? `AND source = '${source}'` : ""}
      ORDER BY createdAt DESC
    `,
    format: "JSON",
  });

  const { data } = await channels.json();
  return ChannelSchema.array().parse(data);
};
