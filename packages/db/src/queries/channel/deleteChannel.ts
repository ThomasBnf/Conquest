import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  workspace_id: string;
};

export const deleteChannel = async ({ external_id, workspace_id }: Props) => {
  return await prisma.channel.delete({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
  });
};
