import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props =
  | {
      external_id: string;
      workspace_id: string;
    }
  | {
      username: string;
      workspace_id: string;
    };

export const getProfile = async (props: Props) => {
  const params: Record<string, string> = {};
  let where = "";

  if ("external_id" in props) {
    const { external_id, workspace_id } = props;
    params.external_id = external_id;
    params.workspace_id = workspace_id;

    where = `external_id = '${external_id}' AND workspace_id = '${workspace_id}'`;
  } else {
    const { username, workspace_id } = props;
    params.username = username;
    params.workspace_id = workspace_id;

    where = `username = '${username}' AND workspace_id = '${workspace_id}'`;
  }

  const result = await client.query({
    query: `
      SELECT *
      FROM profiles
      WHERE ${where}
    `,
    format: "JSON",
  });

  const { data } = await result.json();

  if (data.length === 0) return undefined;
  return ProfileSchema.parse(data[0]);
};
