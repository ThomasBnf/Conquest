import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";

export const countContacts = authAction
  .metadata({ name: "countContacts" })
  .action(async ({ ctx }) => {
    const count = await prisma.contact.count({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    return count;
  });
