import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const listAllProfiles = async ({ workspace_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM profile
      WHERE workspace_id = '${workspace_id}'
    `,
  });

  const { data } = await result.json();
  return ProfileSchema.array().parse(data);
};
