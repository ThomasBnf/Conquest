import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  name: string;
  slug?: string;
  workspace_id: string;
};

export const updateChannel = async ({
  external_id,
  name,
  slug,
  workspace_id,
}: Props) => {
  return await prisma.channels.update({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
    data: {
      name,
      slug,
    },
  });
};
