import {
  type Profile,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../prisma";

type Props = { id: string } & Partial<Profile>;

export const updateProfile = async ({ id, ...data }: Props) => {
  const profile = await prisma.profile.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });

  return ProfileSchema.parse(profile);
};
