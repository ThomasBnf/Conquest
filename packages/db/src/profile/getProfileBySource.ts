import { Source } from "@conquest/zod/enum/source.enum";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../prisma";

type Props = {
  memberId: string;
  source: Source;
  workspaceId: string;
};

export const getProfileBySource = async ({
  memberId,
  source,
  workspaceId,
}: Props) => {
  const profile = await prisma.profile.findFirst({
    where: {
      memberId,
      attributes: {
        path: ["source"],
        equals: source,
      },
      workspaceId,
    },
  });

  if (!profile) return null;
  return ProfileSchema.parse(profile);
};
