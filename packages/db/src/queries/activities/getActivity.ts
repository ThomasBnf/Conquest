import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  workspace_id: string;
};

export const getActivity = async ({ external_id, workspace_id }: Props) => {
  const activity = await prisma.activities.findUnique({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
    include: {
      member: true,
    },
  });

  return activity;
};
