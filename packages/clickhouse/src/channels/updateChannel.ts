import { client } from "../client";

type Props =
  | { id: string; externalId?: string; name?: string }
  | { externalId: string; name: string; workspaceId: string };

export const updateChannel = async (props: Props) => {
  if ("id" in props) {
    const { id, externalId, name } = props;

    return await client.query({
      query: `
        ALTER TABLE channel
        UPDATE 
          ${externalId ? `externalId = '${externalId}',` : ""}
          ${name ? `name = '${name}',` : ""}
          updatedAt = now()
        WHERE id = '${id}'
      `,
    });
  }

  const { externalId, name, workspaceId } = props;

  await client.query({
    query: `
        ALTER TABLE channel
        UPDATE 
          ${externalId ? `externalId = '${externalId}',` : ""}
          ${name ? `name = '${name}',` : ""}
          updatedAt = now()
        WHERE externalId = '${externalId}'
        AND workspaceId = '${workspaceId}'
      `,
  });
};
