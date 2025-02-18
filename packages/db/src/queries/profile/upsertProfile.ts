import {
  type ProfileAttributes,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id: string | null;
  attributes: ProfileAttributes;
  member_id: string;
  workspace_id: string;
};

export const upsertProfile = async ({
  external_id,
  attributes,
  member_id,
  workspace_id,
}: Props) => {
  const profile = await prisma.profile.upsert({
    where: {
      external_id_workspace_id: {
        external_id: external_id ?? "",
        workspace_id,
      },
    },
    update: {
      attributes,
    },
    create: {
      external_id,
      attributes,
      member_id,
      workspace_id,
    },
  });

  return ProfileSchema.parse(profile);
};
