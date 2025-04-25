import { client } from "../client";

type Props =
  | { id: string; name: string }
  | { externalId: string; name: string; workspaceId: string };

export const updateChannel = async (props: Props) => {
  if ("id" in props) {
    const { id, name } = props;
    await client.query({
      query: `
        ALTER TABLE channel
        UPDATE 
          name = '${name}'
        WHERE id = '${id}'
      `,
    });
  }

  if ("externalId" in props) {
    const { externalId, name, workspaceId } = props;

    await client.query({
      query: `
        ALTER TABLE channel
        UPDATE 
          name = '${name}'
        WHERE externalId = '${externalId}'
        AND workspaceId = '${workspaceId}'
      `,
    });
  }
};
