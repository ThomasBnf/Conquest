import { Source } from "@conquest/zod/enum/source.enum";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  memberId: string;
  source: Source;
};

export const getProfileBySource = async ({ memberId, source }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM profile
      WHERE memberId = '${memberId}'
      AND attributes.source = '${source}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  if (data.length === 0) return null;
  return ProfileSchema.parse(data[0]);
};
