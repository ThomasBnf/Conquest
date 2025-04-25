import { client } from "../client";

type Props =
  | {
      id: string;
    }
  | {
      externalId: string;
      workspaceId: string;
    };

export const deleteChannel = async (props: Props) => {
  if ("externalId" in props) {
    const { externalId, workspaceId } = props;

    await client.query({
      query: `
        ALTER TABLE channel
        DELETE WHERE externalId = '${externalId}' 
        AND workspaceId = '${workspaceId}'
      `,
    });
  }

  if ("id" in props) {
    const { id } = props;

    await client.query({
      query: `
        ALTER TABLE channel
        DELETE WHERE id = '${id}'
      `,
    });
  }
};
