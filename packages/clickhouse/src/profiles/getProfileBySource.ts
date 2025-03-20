import { Source } from "@conquest/zod/enum/source.enum";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  member_id: string;
  source: Source;
};

export const getProfileBySource = async ({ member_id, source }: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM profile
      WHERE member_id = '${member_id}'
      AND attributes.source = '${source}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  if (data.length === 0) return null;
  return ProfileSchema.parse(data[0]);
};
