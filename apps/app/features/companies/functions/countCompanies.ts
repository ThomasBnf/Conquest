import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";

export const countCompanies = authAction
  .metadata({ name: "countCompanies" })
  .action(async ({ ctx }) => {
    const workspace_id = ctx.user.workspace_id;

    return await prisma.company.count({
      where: {
        workspace_id,
      },
    });
  });
