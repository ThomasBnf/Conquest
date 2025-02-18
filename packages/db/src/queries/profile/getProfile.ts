import {
  DiscourseProfileSchema,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id?: string | null;
  username?: string | null;
  workspace_id: string;
};

export const getProfile = async ({
  external_id,
  username,
  workspace_id,
}: Props) => {
  if (username) {
    const profile = await prisma.profile.findFirst({
      where: {
        attributes: {
          path: ["username"],
          equals: username,
        },
        workspace_id,
      },
    });

    if (!profile) return null;
    return DiscourseProfileSchema.parse(profile);
  }

  const profile = await prisma.profile.findUnique({
    where: {
      external_id_workspace_id: {
        external_id: external_id ?? "",
        workspace_id,
      },
    },
  });

  if (!profile) return null;
  return ProfileSchema.parse(profile);
};
