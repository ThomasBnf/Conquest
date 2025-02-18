import { prisma } from "../../prisma";

type Props = {
  id?: string;
  external_id?: string;
  channel_id?: string;
  workspace_id: string;
};

export const deleteActivity = async ({
  id,
  channel_id,
  external_id,
  workspace_id,
}: Props) => {
  if (!id) {
    return await prisma.activity.deleteMany({
      where: {
        external_id,
        channel_id,
        workspace_id,
      },
    });
  }

  return await prisma.activity.delete({
    where: { id },
  });
};
