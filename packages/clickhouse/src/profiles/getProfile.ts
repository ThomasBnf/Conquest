import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props =
  | {
      externalId: string;
      workspaceId?: string;
    }
  | {
      username: string;
      workspaceId: string;
    };

export const getProfile = async (props: Props) => {
  const params: Record<string, string> = {};
  let where = "";

  if ("externalId" in props) {
    const { externalId, workspaceId } = props;
    params.externalId = externalId;

    where = `externalId = '${externalId}' ${
      workspaceId ? `AND workspaceId = '${workspaceId}'` : ""
    }`;
  } else {
    const { username, workspaceId } = props;
    params.username = username;
    params.workspaceId = workspaceId;

    where = `attributes.username = '${username}' AND workspaceId = '${workspaceId}'`;
  }

  const result = await client.query({
    query: `
      SELECT *
      FROM profile
      WHERE ${where}
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  if (data.length === 0) return null;
  return ProfileSchema.parse(data[0]);
};
