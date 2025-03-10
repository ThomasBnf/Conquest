import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { client } from "../client";

type Props =
  | {
      external_id: string;
      workspace_id: string;
    }
  | {
      id: string;
    };

export const getChannel = async (props: Props) => {
  if ("external_id" in props) {
    const { external_id, workspace_id } = props;

    const result = await client.query({
      query: `
        SELECT *
        FROM channel
        WHERE external_id = '${external_id}'
        AND workspace_id = '${workspace_id}'
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
