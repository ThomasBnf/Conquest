import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { client } from "../client";

type Props =
  | {
      id: string;
    }
  | {
      externalId: string;
      workspaceId: string;
    };

export const getChannel = async (props: Props) => {
  const query =
    "id" in props
      ? `
      SELECT *
      FROM channel
      WHERE id = '${props.id}'
    `
      : `
      SELECT *
      FROM channel
      WHERE externalId = '${props.externalId}'
      AND workspaceId = '${props.workspaceId}'
    `;

  const result = await client.query({
    query,
    format: "JSON",
  });

  const { data } = await result.json();
  const channel = data[0];

  return channel ? ChannelSchema.parse(channel) : null;
};
