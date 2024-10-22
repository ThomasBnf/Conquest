import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const countMembers = authAction
  .metadata({ name: "countMembers" })
  .action(async ({ ctx }) => {
    const count = await prisma.member.count({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    return count;
  });
