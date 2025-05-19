import { client } from "../client";

type Props =
  | {
      id: string;
    }
  | {
      externalId: string;
      channelId?: string;
      workspaceId: string;
    };

export const deleteActivity = async (props: Props) => {
  let where = "";

  if ("id" in props) {
    const { id } = props;
    where = `id = '${id}'`;
  } else {
    const { externalId, channelId, workspaceId } = props;
    where = `externalId = '${externalId}' AND workspaceId = '${workspaceId}'`;

    if (channelId) {
      where += ` AND channelId = '${channelId}'`;
    }
  }

  await client.query({
    query: `
      ALTER TABLE activity
      DELETE WHERE ${where}
    `,
  });
};
