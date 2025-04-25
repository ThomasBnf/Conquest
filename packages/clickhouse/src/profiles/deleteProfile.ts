import { client } from "../client";

type Props =
  | { id: string }
  | {
      username: string;
      workspaceId: string;
    }
  | {
      externalId: string;
      workspaceId: string;
    };

export const deleteProfile = async (props: Props) => {
  if ("username" in props) {
    const { username, workspaceId } = props;
    await client.query({
      query: `
        ALTER TABLE profile
        DELETE WHERE attributes.username = '${username}'
        AND workspaceId = '${workspaceId}'
      `,
    });
  }

  if ("externalId" in props) {
    const { externalId, workspaceId } = props;
    await client.query({
      query: `
        ALTER TABLE profile
        DELETE WHERE externalId = '${externalId}'
        AND workspaceId = '${workspaceId}'
      `,
    });
  }

  if ("id" in props) {
    const { id } = props;
    await client.query({
      query: `
        ALTER TABLE profile
        DELETE WHERE id = '${id}'
      `,
    });
  }
};
