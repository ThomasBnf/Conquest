import { Member } from "@conquest/zod/schemas/member.schema";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";

type Props = {
  members: Member[];
};

export const listMembersProfiles = async ({ members }: Props) => {
  const ids = members.map((member) => `'${member.id}'`).join(", ");

  const result = await client.query({
    query: `
        SELECT *
        FROM profile
        WHERE memberId IN (${ids})
        `,
  });

  const { data } = await result.json();
  return ProfileSchema.array().parse(data);
};
