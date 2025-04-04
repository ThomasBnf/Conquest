import { client } from "../client";

type Props =
  | { id: string }
  | {
      username: string;
      workspace_id: string;
    }
  | {
      external_id: string;
      workspace_id: string;
    };

export const deleteProfile = async (props: Props) => {
  if ("username" in props) {
    const { username, workspace_id } = props;
    await client.query({
      query: `
        ALTER TABLE profile
        DELETE WHERE attributes.username = '${username}'
        AND workspace_id = '${workspace_id}'
      `,
    });
  }

  if ("external_id" in props) {
    const { external_id, workspace_id } = props;
    await client.query({
      query: `
        ALTER TABLE profile
        DELETE WHERE external_id = '${external_id}'
        AND workspace_id = '${workspace_id}'
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
