import { prisma } from "../../prisma";

type Props = {
  external_id?: string | null;
  username?: string | null;
  workspace_id: string;
};

export const deleteProfile = async ({
  external_id,
  username,
  workspace_id,
}: Props) => {
  if (username) {
    await prisma.profile.deleteMany({
      where: {
        attributes: {
          path: ["username"],
          equals: username,
        },
        workspace_id,
      },
    });
  }

  await prisma.profile.deleteMany({
    where: {
      external_id: external_id ?? "",
      workspace_id,
    },
  });
};
