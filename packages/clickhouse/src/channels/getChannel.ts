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
  const params: Record<string, string> = {};
  let where = "";

  if ("external_id" in props) {
    const { external_id, workspace_id } = props;
    params.external_id = external_id;
    params.workspace_id = workspace_id;

    where = `external_id = '${external_id}' AND workspace_id = '${workspace_id}'`;
  } else {
    const { id } = props;
    params.id = id;

    where = `id = '${id}'`;
  }

  const result = await client.query({
    query: `
      SELECT *
      FROM channels
      WHERE ${where}
    `,
  });

  const { data } = await result.json();
  return ChannelSchema.parse(data[0]);
};
