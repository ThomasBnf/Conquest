import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { prisma } from "../../prisma";

type Props = {
  external_id: string;
  workspace_id: string;
};

export const getActivity = async ({ external_id, workspace_id }: Props) => {
  const activity = await prisma.activity.findUnique({
    where: {
      external_id_workspace_id: {
        external_id,
        workspace_id,
      },
    },
  });

  if (!activity) return null;

  return ActivitySchema.parse(activity);
};
