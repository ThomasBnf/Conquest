import { client } from "../client";

type Props = {
  username: string;
  workspace_id: string;
};

export const deleteProfile = async (props: Props) => {
  const { username, workspace_id } = props;

  await client.query({
    query: `
      DELETE FROM profiles
      WHERE username = '${username}'
      AND workspace_id = '${workspace_id}'
    `,
  });
};
