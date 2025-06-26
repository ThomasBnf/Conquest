import { Member } from "@conquest/zod/schemas/member.schema";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../prisma";

type Props = {
  members: Member[];
};

export const listMembersProfiles = async ({ members }: Props) => {
  const ids = members.map((member) => member.id);

  const profiles = await prisma.profile.findMany({
    where: {
      memberId: {
        in: ids,
      },
    },
  });

  return ProfileSchema.array().parse(profiles);
};
