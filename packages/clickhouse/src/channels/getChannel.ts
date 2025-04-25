import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { client } from "../client";

type Props =
  | {
      externalId: string;
      workspaceId: string;
    }
  | {
      id: string;
    };

export const getChannel = async (props: Props) => {
  if ("externalId" in props) {
    const { externalId, workspaceId } = props;

    const result = await client.query({
      query: `
        SELECT *
        FROM channel
        WHERE externalId = '${externalId}'
        AND workspaceId = '${workspaceId}'
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const channel = data[0];

    if (!channel) return null;
    return ChannelSchema.parse(channel);
  }

  const { id } = props;

  const result = await client.query({
    query: `
      SELECT *
      FROM channel
      WHERE id = '${id}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  const channel = data[0];

  if (!channel) return null;
  return ChannelSchema.parse(channel);
};
