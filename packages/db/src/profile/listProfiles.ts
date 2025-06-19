import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../prisma";

type Props = {
  memberId: string;
  workspaceId: string;
};

export const listProfiles = async ({ memberId, workspaceId }: Props) => {
  const profiles = await prisma.profile.findMany({
    where: {
      memberId,
      workspaceId,
    },
  });

  return ProfileSchema.array().parse(profiles);
};
