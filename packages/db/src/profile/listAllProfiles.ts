import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const listAllProfiles = async ({ workspaceId }: Props) => {
  const profiles = await prisma.profile.findMany({
    where: {
      workspaceId,
    },
  });

  return ProfileSchema.array().parse(profiles);
};
