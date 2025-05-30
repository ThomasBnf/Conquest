import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  externalId: string;
  workspaceId?: string;
};

export const getProfile = async ({ externalId, workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM profile FINAL
      WHERE externalId = '${externalId}'
      AND workspaceId = '${workspaceId}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  if (data.length === 0) return null;
  return ProfileSchema.parse(data[0]);
};
