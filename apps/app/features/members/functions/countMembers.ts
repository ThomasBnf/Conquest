import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";

export const countMembers = authAction
  .metadata({ name: "countMembers" })
  .action(async ({ ctx }) => {
    const workspace_id = ctx.user.workspace_id;

    return await prisma.members.count({
      where: {
        workspace_id,
      },
    });
  });
