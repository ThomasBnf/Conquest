import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  memberId: string;
};

export const listProfiles = async ({ memberId }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM profile FINAL
      WHERE memberId = '${memberId}'
    `,
  });

  const { data } = await result.json();
  return ProfileSchema.array().parse(data);
};
