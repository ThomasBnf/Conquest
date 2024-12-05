import { prisma } from "@/lib/prisma";
import { ActivityWithMemberSchema } from "@conquest/zod/schemas/activity.schema";

type Props = {
  external_id: string;
  workspace_id: string;
};

export const getActivity = async ({ external_id, workspace_id }: Props) => {
  const activity = await prisma.activities.findUnique({
    where: {
      external_id,
      workspace_id,
    },
    include: {
      member: true,
    },
  });

  return ActivityWithMemberSchema.parse(activity);
};
