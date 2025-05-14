import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  workspaceId: string;
};

export const listAllProfiles = async ({ workspaceId }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM profile FINAL
      WHERE workspaceId = '${workspaceId}'
    `,
  });

  const { data } = await result.json();
  return ProfileSchema.array().parse(data);
};
