import type { Channel } from "@conquest/zod/schemas/channel.schema";
import { client } from "../client";

type Props =
  | {
      id: string;
      data: Omit<Partial<Channel>, "updated_at">;
    }
  | {
      external_id: string;
      data: Omit<Partial<Channel>, "updated_at">;
      workspace_id: string;
    };

export const updateChannel = async (props: Props) => {
  const params: Record<string, string> = {};
  let where = "";

  if ("external_id" in props) {
    const { external_id, workspace_id, data } = props;
    params.external_id = external_id;
    params.workspace_id = workspace_id;

    where = `external_id = '${external_id}' AND workspace_id = '${workspace_id}'`;
  } else {
    const { id } = props;
    params.id = id;

    where = `id = '${id}'`;
  }

  const values = Object.entries(props.data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");

  return await client.query({
    query: `
      ALTER TABLE channels
      UPDATE 
        ${values},
        updated_at = now()
      WHERE ${where}
    `,
    format: "JSON",
  });
};
