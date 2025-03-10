import { client } from "../client";

type Props =
  | {
      id: string;
    }
  | {
      external_id: string;
      channel_id?: string;
      workspace_id: string;
    };

export const deleteActivity = async (props: Props) => {
  let where = "";

  if ("id" in props) {
    const { id } = props;
    where = `id = '${id}'`;
  } else {
    const { external_id, channel_id, workspace_id } = props;
    where = `external_id = '${external_id}' AND workspace_id = '${workspace_id}'`;

    if (channel_id) {
      where += ` AND channel_id = '${channel_id}'`;
    }
  }

  await client.query({
    query: `
      ALTER TABLE activity
      DELETE WHERE ${where}
    `,
  });
};
