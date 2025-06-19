import {
  type ProfileAttributes,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../prisma";

type Props = {
  externalId: string;
  attributes: ProfileAttributes;
  memberId: string;
  createdAt?: Date;
  workspaceId: string;
};

export const createProfile = async ({
  externalId,
  attributes,
  memberId,
  createdAt,
  workspaceId,
}: Props) => {
  const profile = await prisma.profile.create({
    data: {
      externalId,
      attributes,
      memberId,
      createdAt,
      workspaceId,
    },
  });

  return ProfileSchema.parse(profile);
};
