import { prisma } from "@conquest/db/prisma";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { protectedProcedure } from "../trpc";

export const listMembersInWorkspace = protectedProcedure.query(
  async ({ ctx }) => {
    const { user } = ctx;
    const { role } = user;

    if (role === "STAFF") {
      const workspaces = await prisma.workspace.findMany({
        orderBy: {
          name: "asc",
        },
      });
      return WorkspaceSchema.array().parse(workspaces);
    }

    const membersInWorkspace = await prisma.memberInWorkspace.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        workspace: {
          name: "asc",
        },
      },
    });

    const workspaces = membersInWorkspace.map((member) => member.workspace);
    return WorkspaceSchema.array().parse(workspaces);
  },
);
