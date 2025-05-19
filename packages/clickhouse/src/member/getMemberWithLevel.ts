import { MemberWithLevelSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";
import { cleanPrefix } from "../helpers/cleanPrefix";

type Props = {
  id: string;
};

export const getMemberWithLevel = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT 
          m.*,
          l.number as level,
          l.name as levelName
        FROM member m FINAL
      LEFT JOIN level l ON m.levelId = l.id
      WHERE m.id = '${id}'
    `,
  });

  const { data } = await result.json();

  const cleanData = cleanPrefix("m.", data);
  return MemberWithLevelSchema.parse(cleanData[0]);
};
