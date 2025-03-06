import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  member_id: string;
};

export const listProfiles = async ({ member_id }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM profile
      WHERE member_id = '${member_id}'
    `,
  });

  const { data } = await result.json();
  return ProfileSchema.array().parse(data);
};
