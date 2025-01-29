import type { Member } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../../prisma";

type Props = {
  member: Member;
};

export const getFirstActivity = async ({ member }: Props) => {
  const { id, workspace_id } = member;

  const firstActivity = await prisma.activities.findFirst({
    where: {
      member_id: id,
      workspace_id,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return firstActivity;
};
