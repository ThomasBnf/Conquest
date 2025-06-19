import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../prisma";

type Props = {
  externalId: string;
  workspaceId?: string;
};

export const getProfile = async ({ externalId, workspaceId }: Props) => {
  const profile = await prisma.profile.findFirst({
    where: {
      externalId,
      ...(workspaceId && { workspaceId }),
    },
  });

  if (!profile) return null;
  return ProfileSchema.parse(profile);
};
